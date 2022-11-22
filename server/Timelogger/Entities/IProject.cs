using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace Timelogger.Entities;

public interface IProject {
	/// <summary>ID of the project.</summary>
	int ProjectId { get; set; }

	/// <summary>Name of the project.</summary>
	string Name { get; set; }

	/// <summary>Project description.</summary>
	string Description { get; set; }

	/// <summary>Date until which the project must be completed.</summary>
	DateTime Deadline { get; set; }

	/// <summary>Indicates, whether the project has been completed.</summary>
	/// <remarks>Changes cannot be made to a project, if it is marked as completed.</remarks>
	bool IsCompleted { get; set; }

	/// <summary>Amount of milliseconds used on the project's tasks.</summary>
	int TrackedMillis { get; }

	/// <summary>Tasks associated with the project.</summary>
	ICollection<Task> Tasks { get; set; }
}