using System.Collections.Generic;
using System.Linq;
using FluentValidation.Results;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Query;
using Timelogger.Entities;

namespace Timelogger.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class TasksController : Controller {
	private readonly ApiContext _context;

	public TasksController(ApiContext context) {
		_context = context;
	}


	// Get all tasks (f/e: /tasks)
	// GET api/tasks/all
	[HttpGet("all")]
	public IActionResult GetProjectsWithTasksAndSubtasks() {
		var query =
			_context.Projects
			        .Include(p => p.Tasks)
			        .ThenInclude(t => t.TimeRecords)
			        .Include(p => p.Tasks)
			        .ThenInclude(t => t.Subtasks)
			        .ThenInclude(st => st.TimeRecords);

		var res = query.Select(p => new {
				p.ProjectId,
				p.Name,
				p.Deadline,
				Tasks = p.Tasks.Where(t => t.ParentTaskId == null).Select(t => new {
					t.TaskId,
					t.Name,
					t.IsCompleted,
					t.IsParentTask,
					t.OwnTrackedMillis,
					Subtasks = t.Subtasks.Select(st => new {
						st.TaskId,
						st.Name,
						st.IsCompleted,
						st.IsParentTask,
						st.OwnTrackedMillis
					})
				})
			}
		).OrderBy(d => d.Deadline);

		return Ok(res);
	}


	// Get specific task by ID (f/e: /tasks/{taskId})
	// GET api/tasks?taskId={taskId}
	[HttpGet(Name = "GetTask")]
	public IActionResult GetTask(int taskId) {
		Task t =
			_context.Tasks
			        .Include(t => t.Project)
			        .Include(t => t.TimeRecords)
			        .Include(t => t.ParentTask)
			        .Include(t => t.Subtasks)
			        .ThenInclude(st => st.TimeRecords)
			        .SingleOrDefault(t => t.TaskId == taskId);

		// If task not found
		if ( t == null ) {
			return BadRequest(new {
				Code = "ID-404",
				Cause = "ID not found",
				Errors = new [] {
					new {
						Name = "TaskId",
						Error = $"Task with ID {taskId} does not exist."
					}
				}
			});
		}

		// Return task
		var res = new {
			t.TaskId,
			t.Name,
			t.Description,
			t.IsCompleted,
			t.TrackedMillis,
			t.IsParentTask,
			t.IsSubtask,
			ParentTask = t.IsSubtask
				? new {
					t.ParentTask.Name,
					t.ParentTask.TaskId,
				}
				: null,
			Project = new {
				t.Project.Name,
				t.Project.ProjectId,
				t.Project.Deadline
			},
			Subtasks = t.Subtasks
			            .Select(st => new {
				            st.TaskId,
				            st.Name,
				            st.IsCompleted,
				            st.TrackedMillis
			            }),
			TimeRecords = t.TimeRecords
			               .Select(tr => new {
				               tr.TaskId,
				               tr.StartTime,
				               tr.EndTime,
				               tr.TrackedMillis,
				               tr.Note
			               })
		};

		return Ok(res);
	}


	// Create task
	// POST api/tasks/create
	[HttpPost("create")]
	public IActionResult CreateTask([FromBody] Task task) {
		TaskValidator validator = new(_context);
		ValidationResult result = validator.Validate(task);

		// If validation fails
		if ( !result.IsValid ) {
			return BadRequest(new {
				Code = "VAL-400",
				Cause = "Validation failed",
				Errors = result.Errors.Select(e => new {
					Name = e.PropertyName,
					Error = e.ErrorMessage
				})
			});
		}

		_context.Tasks.Add(task);
		_context.SaveChanges();

		return CreatedAtAction(nameof(GetTask), new {taskId = task.TaskId}, task);
	}


	// Update task
	// PUT api/tasks/update?taskId=1
	[HttpPut("update")]
	public IActionResult UpdateTask([FromBody] Task task, int taskId) {
		Task taskToUpdate = _context.Tasks.Find(taskId);

		// If task not found
		if (taskToUpdate == null) {
			return BadRequest(new {
				Code = "ID-404",
				Cause = "ID not found",
				Errors = new [] {
					new {
						Name = "TaskId",
						Error = $"Task with ID {taskId} does not exist."
					}
				}
			});
		}

		TaskValidator validator = new(_context);
		ValidationResult result = validator.Validate(task);

		// If validation fails
		if ( !result.IsValid ) {
			return BadRequest(new {
				Code = "VAL-400",
				Cause = "Validation failed",
				Errors = result.Errors.Select(e => new {
					Name = e.PropertyName,
					Error = e.ErrorMessage
				})
			});
		}

		// Update task
		taskToUpdate.Name = task.Name;
		taskToUpdate.Description = task.Description;
		taskToUpdate.IsCompleted = task.IsCompleted;
		taskToUpdate.ProjectId = task.ProjectId;
		taskToUpdate.ParentTaskId = task.ParentTaskId;
		_context.SaveChanges();

		return NoContent();
	}


	// Delete task
	// DELETE api/tasks/delete?taskId=1
	[HttpDelete("delete")]
	public IActionResult DeleteTask(int taskId) {
		Task taskToDelete = _context.Tasks.Find(taskId);

		// If task not found
		if (taskToDelete == null) {
			return BadRequest(new {
				Code = "ID-404",
				Cause = "ID not found",
				Errors = new [] {
					new {
						Name = "TaskId",
						Error = $"Task with ID {taskId} does not exist."
					}
				}
			});
		}

		_context.Tasks.Remove(taskToDelete);
		_context.SaveChanges();

		return NoContent();
	}
}