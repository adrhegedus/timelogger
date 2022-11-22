using Microsoft.EntityFrameworkCore;
using Timelogger.Entities;


namespace Timelogger;

public class ApiContext : DbContext {
	public ApiContext(DbContextOptions<ApiContext> options) : base(options) { }

	public DbSet<Project> Projects { get; set; }

	public DbSet<TimeRecord> TimeRecords { get; set; }

	public DbSet<Task> Tasks { get; set; }

	protected override void OnModelCreating(ModelBuilder modelBuilder) {
		// Task 1:* TimeRecord
		modelBuilder.Entity<TimeRecord>()
		            .HasOne(tr => tr.Task)
		            .WithMany(ta => ta.TimeRecords)
		            .IsRequired();

		// Project 1:* Task
		modelBuilder.Entity<Task>()
		            .HasOne(t => t.Project)
		            .WithMany(p => p.Tasks)
		            .IsRequired();

		// Task 0:* Task
		modelBuilder.Entity<Task>()
		            .HasOne(st => st.ParentTask)
		            .WithMany(pt => pt.Subtasks)
		            .IsRequired(false);
	}
}