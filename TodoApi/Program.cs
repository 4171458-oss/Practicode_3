using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using Microsoft.OpenApi.Models;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using TodoApi.Data;
using TodoApi.Models;

var builder = WebApplication.CreateBuilder(args);

// =====================
// JWT Authentication

// =====================

var jwtKey = builder.Configuration["Jwt:Key"];
var jwtIssuer = builder.Configuration["Jwt:Issuer"];
var jwtAudience = builder.Configuration["Jwt:Audience"];
var key = Encoding.ASCII.GetBytes(jwtKey);

builder.Services.AddAuthentication(options =>
{
    options.DefaultAuthenticateScheme = "Bearer";
    options.DefaultChallengeScheme = "Bearer";
})
.AddJwtBearer("Bearer", options =>
{
    options.TokenValidationParameters = new TokenValidationParameters
    {
        ValidateIssuer = true,
        ValidateAudience = true,
        ValidateIssuerSigningKey = true,
        ValidIssuer = jwtIssuer,
        ValidAudience = jwtAudience,
        IssuerSigningKey = new SymmetricSecurityKey(key)
    };
});

// =====================
// Services
// =====================
builder.Services.AddControllers();
builder.Services.AddCors(p => p.AddPolicy("AllowAll", b => b.AllowAnyOrigin().AllowAnyHeader().AllowAnyMethod()));
builder.Services.AddDbContext<ToDoDbContext>(options =>
    options.UseMySql(builder.Configuration.GetConnectionString("ToDoDB"), new MySqlServerVersion(new Version(8, 0, 44))));

builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen(c => c.SwaggerDoc("v1", new OpenApiInfo { Title = "Todo API", Version = "v1" }));

var app = builder.Build();

// =====================
// Middleware
// =====================
app.UseCors("AllowAll");
app.UseAuthentication();
app.UseAuthorization();


if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

app.UseHttpsRedirection();

// =====================
// Tasks endpoints
// =====================

app.MapGet("/tasks", async (ToDoDbContext db, HttpContext context) =>
{
    var userIdClaim = context.User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
    if (string.IsNullOrEmpty(userIdClaim)) return Results.Unauthorized();
    
    var userId = int.Parse(userIdClaim);
    var items = await db.Items.Where(i => i.UserId == userId).ToListAsync();
    return Results.Ok(items);
}).RequireAuthorization();

app.MapPost("/tasks", async (ToDoDbContext db, HttpContext context, Item newItem) =>
{
    var userIdClaim = context.User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
    if (string.IsNullOrEmpty(userIdClaim)) return Results.Unauthorized();
    
    var userId = int.Parse(userIdClaim);
    newItem.UserId = userId;
    db.Items.Add(newItem);
    await db.SaveChangesAsync();
    return Results.Created($"/tasks/{newItem.Id}", newItem);
}).RequireAuthorization();

app.MapPut("/tasks/{id}", async (ToDoDbContext db, HttpContext context, int id, Item updatedItem) =>
{
    var userIdClaim = context.User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
    if (string.IsNullOrEmpty(userIdClaim)) return Results.Unauthorized();
    
    var userId = int.Parse(userIdClaim);
    var item = await db.Items.FindAsync(id);
    if (item == null || item.UserId != userId) return Results.NotFound();
    
    item.Name = updatedItem.Name;
    item.IsComplete = updatedItem.IsComplete;
    await db.SaveChangesAsync();
    return Results.Ok(item);
}).RequireAuthorization();

app.MapDelete("/tasks/{id}", async (ToDoDbContext db, HttpContext context, int id) =>
{
    var userIdClaim = context.User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
    if (string.IsNullOrEmpty(userIdClaim)) return Results.Unauthorized();
    
    var userId = int.Parse(userIdClaim);
    var item = await db.Items.FindAsync(id);
    if (item == null || item.UserId != userId) return Results.NotFound();
    
    db.Items.Remove(item);
    await db.SaveChangesAsync();
    return Results.NoContent();
}).RequireAuthorization();

// =====================
// Auth endpoints
// =====================
app.MapPost("/register", async (ToDoDbContext db, User user) =>
{
    try
    {
        if (string.IsNullOrEmpty(user.Username) || string.IsNullOrEmpty(user.PasswordHash))
            return Results.BadRequest("Username or password is empty.");

        // Hash password
        user.PasswordHash = BCrypt.Net.BCrypt.HashPassword(user.PasswordHash);

        db.Users.Add(user);
        await db.SaveChangesAsync();
        return Results.Ok(new { user.Id, user.Username });
    }
    catch (Exception ex)
    {
        Console.WriteLine(ex); // הדפסת השגיאה
        return Results.Problem("Registration failed: " + ex.Message);
    }
});


app.MapPost("/login", async (ToDoDbContext db, LoginRequest login) =>
{
    try
    {
        var user = await db.Users.FirstOrDefaultAsync(u => u.Username == login.Username);
        if (user == null || !BCrypt.Net.BCrypt.Verify(login.Password, user.PasswordHash))
            return Results.Unauthorized();

        var tokenHandler = new JwtSecurityTokenHandler();
        var tokenKey = Encoding.ASCII.GetBytes(jwtKey);
        var tokenDescriptor = new SecurityTokenDescriptor
        {
            Subject = new ClaimsIdentity(new[]
            {
                new Claim(ClaimTypes.Name, user.Username),
                new Claim(ClaimTypes.NameIdentifier, user.Id.ToString())
            }),
            Expires = DateTime.UtcNow.AddHours(1),
            Issuer = jwtIssuer,
            Audience = jwtAudience,
            SigningCredentials = new SigningCredentials(new SymmetricSecurityKey(tokenKey), SecurityAlgorithms.HmacSha256Signature)
        };

        var token = tokenHandler.CreateToken(tokenDescriptor);
        var jwt = tokenHandler.WriteToken(token);

        return Results.Ok(new { token = jwt });
    }
    catch (Exception ex)
    {
        // להדפיס את השגיאה בקונסול
        Console.WriteLine(ex);
        return Results.Problem("Internal Server Error: " + ex.Message);
    }
});


app.Run();
