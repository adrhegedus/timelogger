using System.Linq;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Timelogger.Api.Controllers;
using Timelogger.Entities;
using Xunit;

namespace Timelogger.Api.Tests;

public class TasksControllerTests {
	private readonly TasksController _sut;
	private readonly ApiContext _context = new (new DbContextOptionsBuilder<ApiContext>()
	                                            .UseInMemoryDatabase("TestDb").Options);


	public TasksControllerTests() {
		Utility.SeedDatabase(_context);
		_sut = new TasksController(_context);
	}


	[Fact]
	public void GetTask_ReturnsTask_WhenValidID() {
		const int validId = 1;

		IActionResult result = _sut.GetTask(validId);
		Assert.NotNull(result);
	}


	[Fact]
	public void GetTask_ResponseContainsSubtasks_WhenTaskIsParentTask() {
		const int IdOfTaskWithSubtasks = 2;
		Task taskWithSubtasks = _context.Tasks.Find(IdOfTaskWithSubtasks);

		IActionResult result = _sut.GetTask(IdOfTaskWithSubtasks);

		Assert.Equal(1, taskWithSubtasks.Subtasks.Count);
		Assert.Equivalent(new {
			Subtasks = taskWithSubtasks
			           .Subtasks
			           .Select(st => new {
				           st.TaskId,
				           st.Name,
				           st.IsCompleted,
				           st.TrackedMillis
			           })
			}, ((OkObjectResult) result).Value);
	}


	[Fact]
	public void GetTask_ResponseSumsTrackedTimeOfSelfAndSubtasks_WhenTaskIsParentTask() {
		const int IdOfTaskWithSubtasks = 2;
		Task taskWithSubtasks = _context.Tasks.Find(IdOfTaskWithSubtasks);
		Task subtask = taskWithSubtasks.Subtasks.First();

		IActionResult result = _sut.GetTask(IdOfTaskWithSubtasks);

		Assert.Equal(21960000, taskWithSubtasks.TimeRecords.Sum(tr => tr.TrackedMillis));
		Assert.Equal(1800000, subtask.TimeRecords.Sum(tr => tr.TrackedMillis));

		Assert.Equivalent(new {
			TrackedMillis = taskWithSubtasks.TimeRecords
			                                .Sum(tr => tr.TrackedMillis) + 
			                taskWithSubtasks.Subtasks
			                                .Sum(st => st.TimeRecords.Sum(tr => tr.TrackedMillis))
		}, ((OkObjectResult) result).Value);
	}



	[Fact]
	public void GetTask_ReturnsNotFoundWithProps_WhenInvalidID() {
		const int invalidId = 100;
		IActionResult result = _sut.GetTask(invalidId);

		Assert.IsType<BadRequestObjectResult>(result);
		Assert.Equivalent(new {
			Code = "ID-404",
			Cause = "ID not found",
			Errors = new [] {
				new {
					Name = "TaskId",
					Error = $"Task with ID {invalidId} does not exist."
				}
			}
		}, ((BadRequestObjectResult) result).Value);
	}


	[Fact]
	public void CreateTask_ReturnsCreatedTaskWithLocation_WhenValidTask() {
		Task task = new () {
			Name = "Test Task",
			Description = "Test Description",
			IsCompleted = false,
			ProjectId = 1
		};

		IActionResult result = _sut.CreateTask(task);

		Assert.IsType<CreatedAtActionResult>(result);
		Assert.Equal(task, ((CreatedAtActionResult) result).Value);
		Assert.Equal("GetTask", ((CreatedAtActionResult) result).ActionName);
		Assert.Equal(task.TaskId, ((CreatedAtActionResult) result).RouteValues["taskId"]);
	}


	[Fact]
	public void CreateTask_ReturnsBadRequestWithProps_WhenInvalidTask() {
		Task task = new ();

		IActionResult result = _sut.CreateTask(task);

		Assert.IsType<BadRequestObjectResult>(result);
		Assert.Equivalent(new {
			Code = "VAL-400",
			Cause = "Validation failed",
			Errors = new []{
				new {
					Name = "Name",
					Error = "Tasks must have a name."
				},
				new {
					Name = "ProjectId",
					Error = "Tasks must be assigned to a project."
				}
			}
		}, ((BadRequestObjectResult) result).Value);
	}


	[Fact]
	public void CreateTask_ReturnsBadRequestWithProps_WhenInvalidProjectId() {
		Task task = _context.Tasks.Find(1);
		task.ProjectId = 100;

		IActionResult result = _sut.CreateTask(task);

		Assert.IsType<BadRequestObjectResult>(result);
		Assert.Equivalent(new {
			Code = "VAL-400",
			Cause = "Validation failed",
			Errors = new []{
				new {
					Name = "ProjectId",
					Error = "Project with ID 100 does not exist."
				}
			}
		}, ((BadRequestObjectResult) result).Value);
	}


	[Fact]
	public void CreateTask_ReturnsBadRequestWithProps_WhenInvalidParentTaskId() {
		Task task = _context.Tasks.Find(1);
		task.ParentTaskId = 100;

		IActionResult result = _sut.CreateTask(task);

		Assert.IsType<BadRequestObjectResult>(result);
		Assert.Equivalent(new {
			Code = "VAL-400",
			Cause = "Validation failed",
			Errors = new []{
				new {
					Name = "ParentTaskId",
					Error = "Task with ID 100 does not exist."
				}
			}
		}, ((BadRequestObjectResult) result).Value);
	}


	[Fact]
	public void CreateTask_Rejects_WhenSubtaskWithProjectIdNotMatchingParentTasksProjectId() {
		Task parent = _context.Tasks.Find(1);
		Task subtask = new () {
			Name = "Test Task",
			Description = "Test Description",
			IsCompleted = false,
			ProjectId = 2,
			ParentTaskId = parent.TaskId
		};

		IActionResult result = _sut.CreateTask(subtask);

		Assert.NotEqual(2, parent.ProjectId);
		Assert.IsType<BadRequestObjectResult>(result);
	}


	[Fact]
	public void CreateTask_Rejects_WhenParentTaskIdIsASubtask() {
		Task subtask = _context.Tasks.Find(5);
		Task task = new () {
			Name = "Test Task",
			Description = "Test Description",
			IsCompleted = false,
			ProjectId = subtask.ProjectId,
			ParentTaskId = subtask.TaskId
		};

		IActionResult result = _sut.CreateTask(task);

		Assert.True(subtask.IsSubtask);
		Assert.IsType<BadRequestObjectResult>(result);
		Assert.Equivalent(new {
			Code = "VAL-400",
			Cause = "Validation failed",
			Errors = new []{
				new {
					Name = "ParentTaskId",
					Error = "Nested subtasks are not supported."
				}
			}
		}, ((BadRequestObjectResult) result).Value);
	}


	// TODO: Update not updating
	// [Fact]
	// public void UpdateTask_UpdatesEntryWithDefinedProperties_WhenValidTask() {
	// 	const int taskId = 1;
	// 	Task pre_update = new() {
	// 		Name = _context.Tasks.Find(taskId).Name,
	// 		Description = "",
	// 		IsCompleted = _context.Tasks.Find(taskId).IsCompleted
	// 	};
	//
	// 	Task new_task = new() {
	// 		TaskId = taskId,
	// 		Description = "Updated Task",
	// 		IsCompleted = null
	// 	};
	//
	// 	_sut.UpdateTask(new_task, taskId);
	// 	_context.Entry(_context.Tasks.Find(taskId)).Reload();									 // Happens automatically in real scenario
	//
	// 	Task post_update = _context.Tasks.Find(taskId);
	//
	// 	Assert.Equal(new_task.Description, post_update.Description);								 // Description was provided and updated
	// 	Assert.Equal(pre_update.Name, post_update.Name);											 // Name was not provided and remains the same
	// }


	[Fact]
	public void UpdateTask_ReturnsBadRequestWithProps_WhenInvalidTask() {
		Task task = new ();

		IActionResult result = _sut.UpdateTask(task, 1);

		Assert.IsType<BadRequestObjectResult>(result);
		Assert.Contains("Code = VAL-400, Cause = Validation failed, Errors = ",
		                ((BadRequestObjectResult)result).Value.ToString());
	}


	[Fact]
	public void UpdateTask_ReturnsNotFoundWithProps_WhenInvalidID() {
		Task task = new ();

		IActionResult result = _sut.UpdateTask(task, 100);

		Assert.IsType<BadRequestObjectResult>(result);
		Assert.Equivalent(new {
			Code = "ID-404",
			Cause = "ID not found",
			Errors = new [] {
				new {
					Name = "TaskId",
					Error = "Task with ID 100 does not exist."
				}
			}
		}, ((BadRequestObjectResult) result).Value);
	}


	[Fact]
	public void UpdateTask_TaskCannotBeItsOwnParent() {
		Task task = _context.Tasks.Find(1);
		task.ParentTaskId = task.TaskId;

		IActionResult result = _sut.UpdateTask(task, task.TaskId);

		Assert.IsType<BadRequestObjectResult>(result);
		Assert.Equivalent(new {
			Code = "VAL-400",
			Cause = "Validation failed",
			Errors = new []{
				new {
					Name = "ParentTaskId",
					Error = "Task cannot be its own parent."
				}
			}
		}, ((BadRequestObjectResult) result).Value);
	}


	[Fact]
	public void DeleteTask_DeletesTask_WhenValidID() {
		const int validId = 1;

		_sut.DeleteTask(validId);
		Assert.Null(_context.Tasks.Find(validId));
	}


	[Fact]
	public void DeleteTask_ReturnsErrorWithProps_WhenInvalidID() {
		const int invalidId = 100;

		IActionResult result = _sut.DeleteTask(invalidId);

		Assert.IsType<BadRequestObjectResult>(result);
		Assert.Equivalent(new {
			Code = "ID-404",
			Cause = "ID not found",
			Errors = new [] {
				new {
					Name = "TaskId",
					Error = $"Task with ID {invalidId} does not exist."
				}
			}
		}, ((BadRequestObjectResult) result).Value);
	}


	[Fact]
	public void DeleteTask_CascadeDeletesSubtasks_WhenValidID() {
		const int validId = 2;
		int attachedTasks = _context.Tasks.Find(validId).Subtasks.Count;

		_sut.DeleteTask(validId);
		Assert.NotEqual(0, attachedTasks);
		Assert.Empty(_context.Tasks.Where(t => t.ParentTaskId == validId));
	}
}