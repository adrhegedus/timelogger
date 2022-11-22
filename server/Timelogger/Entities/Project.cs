using System;
using System.Linq;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using FluentValidation;

namespace Timelogger.Entities;

public sealed class Project : IProject {
	public ICollection<Task> Tasks { get; set; }

	[Key]
	public int ProjectId { get; set; }

	public string Name { get; set; }

	public string Description { get; set; }

	public DateTime Deadline { get; set; }

	public bool IsCompleted { get; set; }

	[NotMapped]
	public int TrackedMillis => Tasks?.Where(t => !t.IsSubtask).Sum(t => t.TrackedMillis) ?? 0;
}


public sealed class ProjectValidator : AbstractValidator<Project> {
	public ProjectValidator() {
		RuleFor(p => p.Name).NotEmpty().WithMessage("Projects must have a name.");
		RuleFor(p => p.Deadline).NotEmpty().WithMessage("Projects must have a deadline.");
		RuleFor(p => p.IsCompleted).NotNull().WithMessage("Projects must have a completion status.");
	}
}