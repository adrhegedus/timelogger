using System.Collections.Generic;
using System.ComponentModel;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace Timelogger.Entities;

public interface ITask {
	/// <summary>ID of the task.</summary>
	int TaskId { get; set; }

	/// <summary>Name of the task.</summary>
	string Name { get; set; }

	/// <summary>Description of the task.</summary>
	string Description { get; set; }

	/// <summary>Completion status of the task.</summary>
	/// <remarks>Time records cannot be added to a task once it is completed.</remarks>
	bool? IsCompleted { get; set; }

	/// <summary>Time records associated with the task.</summary>
	ICollection<TimeRecord> TimeRecords { get; set; }

	/// <summary>Sum of milliseconds tracked on this task and owned subtasks, if any.</summary>
	int TrackedMillis { get; }

	/// <summary>Sum of milliseconds tracked on this task only.</summary>
	int OwnTrackedMillis { get;  }

	/// <summary>Project the task belongs to.</summary>
	int ProjectId { get; set; }
	Project Project { get; set; }

	/// <summary>Parent task.</summary>
	/// <remarks>Null if the task is not a subtask.</remarks>
	int? ParentTaskId { get; set; }
	Task ParentTask { get; set; }

	/// <summary>Subtasks.</summary>
	ICollection<Task> Subtasks { get; set; }

	/// <summary>Indicates whether the task is a subtask.</summary>
	bool IsSubtask { get; }

	/// <summary>Indicates whether the task is a parent task.</summary>
	bool IsParentTask { get; }
}