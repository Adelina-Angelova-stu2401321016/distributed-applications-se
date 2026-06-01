using Microsoft.EntityFrameworkCore;
using MuseumManagmentSystem.Entities;

namespace MuseumManagmentSystem.Infrastructure.Data
{
    public class AppDbContext : DbContext
    {
        public AppDbContext(DbContextOptions options) : base(options)
        {
            
        }

        public DbSet<UserRole> UserRoles { get; set; }
        public DbSet<User> Users { get; set; }

        public DbSet<Exhibit> Exhibits { get; set; }
        public DbSet<Room> Rooms { get; set; }

        public DbSet<ExhibitRoom> ExhibitRooms { get; set; }

        public DbSet<Collection> Collections { get; set; }
        public DbSet<Item> Items { get; set; }
        public DbSet<ExhibitItem> ExhibitItems { get; set; }
        public DbSet<Entities.Attribute> Attributes { get; set; } 
        public DbSet<AttributeValue> AttributeValues { get; set; } 
        public DbSet<ItemAttrValue> ItemAttrValues { get; set; } 
        public DbSet<PartnerType> PartnerTypes { get; set; } 
        public DbSet<Partner> Partners { get; set; } 

        public DbSet<Loan> Loans { get; set; } 
        public DbSet<Study> Studies { get; set; } 

        public DbSet<LoanItem> LoanItems { get; set; } 
        public DbSet<StudyResearcher> StudyResearchers { get; set; }
        public DbSet<Student> Students { get; set; } 
        public DbSet<StudyStudent> StudyStudents { get; set; } 
        public DbSet<Fund> Funds { get; set; } 

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            base.OnModelCreating(modelBuilder);

            modelBuilder.Entity<Exhibit>()
                .HasOne(e => e.Curator)
                .WithMany() 
                .HasForeignKey(e => e.CuratorID)
                .HasPrincipalKey(u => u.ID);
            modelBuilder.Entity<StudyResearcher>()
                .HasOne(e => e.Researcher)
                .WithMany()
                .HasForeignKey(e => e.ResearcherID)
                .HasPrincipalKey(u => u.ID); 

        }

    }
}
