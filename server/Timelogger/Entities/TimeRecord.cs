using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using System.Linq;
using FluentValidation;

namespace Timelogger.Entities;

public sealed class TimeRecord {
	#region Properties
	[Key]
	public int TimeRecordId { get; set; }

	public DateTime StartTime { get; set; }

	public DateTime EndTime { get; set; }

	public string Note { get; set; }

	[ForeignKey("Task")]
	public int TaskId { get; set; }
	public Task Task { get; set; }


	[NotMapped]
	public TimeSpan Duration => EndTime - StartTime;

	[NotMapped]
	public int TrackedMillis => (int)Duration.TotalMilliseconds;

	#endregion
	// --------------------------------------------------


	#region Operators
	public static TimeSpan operator +(TimeRecord t1, TimeRecord t2) => t1.Duration + t2.Duration;
	public static TimeSpan operator -(TimeRecord t1, TimeRecord t2) => t1.Duration - t2.Duration;
	public static implicit operator TimeSpan(TimeRecord TimeRecord) => TimeRecord.Duration;

	#endregion
	// --------------------------------------------------
}


public sealed class TimeRecordValidator : AbstractValidator<TimeRecord> {
	public TimeRecordValidator(ApiContext context) {
		RuleFor(x => x.StartTime).NotEmpty().WithMessage("Start time is required.");
		RuleFor(x => x.EndTime).NotEmpty().WithMessage("End time is required.");

		RuleFor(x => x.StartTime)
			.LessThan(x => x.EndTime)
			.OverridePropertyName("Chronology")
			.WithMessage("Start time must be before end time.");

		RuleFor(x => x.EndTime - x.StartTime)
			.GreaterThanOrEqualTo(TimeSpan.FromMinutes(30))
			.Unless(x => x.EndTime < x.StartTime)
			.WithName("Duration")
			.WithMessage("Time record must be at least 30 minutes long.");

		RuleFor(x => x.TaskId)
			.NotEmpty()
			.WithMessage("Time records must be assigned to a task")
			.Must(TaskId => context.Tasks.Any(y => y.TaskId == TaskId))
			.WithMessage(TaskId => $"Task with ID {TaskId} does not exist.");

		RuleFor(x => x.TaskId)
			.Must(TaskId => {
					Task task = context.Tasks.Find(TaskId);
					return context.Projects.Find(task.ProjectId).IsCompleted == false;
				}
			)
			.WithMessage("Time records cannot be added to completed projects.");
	}
}