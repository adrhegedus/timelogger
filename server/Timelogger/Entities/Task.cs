using System;
using System.Linq;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using FluentValidation;

namespace Timelogger.Entities;

public sealed class Task : ITask {

	#region Properties
	[Key, Required]
	public int TaskId { get; set; }

	[Required]
	public string Name { get; set; }

	public string Description { get; set; }

	[Required]
	public bool? IsCompleted { get; set; }

	#endregion
	// --------------------------------------------------


	#region Relations
	public ICollection<TimeRecord> TimeRecords { get; set; }

	[ForeignKey("Project"), Required]
	public int ProjectId { get; set; }
	public Project Project { get; set; }

	[ForeignKey("Task")]
	public int? ParentTaskId { get; set; }
	public Task ParentTask { get; set; }
	public ICollection<Task> Subtasks { get; set; }

	[NotMapped]
	public bool IsSubtask => ParentTaskId.HasValue;

	[NotMapped]
	public bool IsParentTask => Subtasks?.Count > 0;

	[NotMapped]
	public int TrackedMillis {
		get {
			if ( TimeRecords is null ) return 0;

			TimeSpan aggregate =
				TimeRecords.Aggregate(new TimeSpan(), (current, next) => current + next);

			int total = IsParentTask
				? (int)aggregate.TotalMilliseconds + Subtasks.Sum(subtask => subtask.TrackedMillis)
				: (int)aggregate.TotalMilliseconds;

			return total;
		}
	}

	[NotMapped]
	public int OwnTrackedMillis => TimeRecords?.Sum(record => record.TrackedMillis) ?? 0;

	#endregion
	// --------------------------------------------------
}


public sealed class TaskValidator : AbstractValidator<Task> {
	public TaskValidator(ApiContext context) {
		RuleFor(task => task.Name).NotEmpty().WithMessage("Tasks must have a name.");
		RuleFor(task => task.ProjectId)
			.NotEmpty()
			.WithMessage("Tasks must be assigned to a project.")
			.Must(projectId => context.Projects.Any(project => project.ProjectId == projectId))
			.WithMessage(task => $"Project with ID {task.ProjectId} does not exist.");

		RuleFor(task => task.ParentTaskId)
			.Must(parentTaskId => context.Tasks.Any(task => task.TaskId == parentTaskId))
			.When(task => task.ParentTaskId.HasValue)
			.WithMessage(task => $"Task with ID {task.ParentTaskId} does not exist.")
			.NotEqual(task => task.TaskId)
			.WithMessage("Task cannot be its own parent.")
			.Must(parentTaskId => !context.Tasks.Find(parentTaskId).IsSubtask)
			.When(task => task.ParentTaskId.HasValue)
			.WithMessage("Nested subtasks are not supported.");

		RuleFor(task => task.ProjectId)
			.Must((task, ProjectId) => {
				Task parent = context.Tasks.Find(task.ParentTaskId);
				return parent?.ProjectId == ProjectId;
			})
			.When(task => task.ParentTaskId.HasValue)
			.WithMessage("Subtasks cannot be assigned to other project than its parent's project.");
	}
}