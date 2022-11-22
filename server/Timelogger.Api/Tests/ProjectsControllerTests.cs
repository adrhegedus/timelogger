using System;
using System.Collections.Generic;
using System.Linq;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Timelogger.Api.Controllers;
using Timelogger.Entities;
using Xunit;

namespace Timelogger.Api.Tests;

public class ProjectsControllerTests {
	private readonly ProjectsController _sut;
	private readonly ApiContext _context = new (new DbContextOptionsBuilder<ApiContext>()
	                                            .UseInMemoryDatabase("TestDb").Options);

	public ProjectsControllerTests() {
		Utility.SeedDatabase(_context);
		_sut = new ProjectsController(_context);
	}


	[Fact]
	public void GetProject_ReturnsProject_WhenValidID() {
		const int validId = 1;

		IActionResult result = _sut.GetProject(validId);
		Assert.NotNull(result);
	}


	[Fact]
	public void GetProject_ReturnsNotFoundWithProps_WhenInvalidID() {
		const int invalidId = 100;
		IActionResult result = _sut.GetProject(invalidId);

		Assert.IsType<BadRequestObjectResult>(result);
		Assert.Equivalent(new {
			Code = "ID-404",
			Cause = "ID not found",
			Errors = new [] {
				new {
					Name = "ProjectId",
					Error = "Project with ID 100 does not exist."
				}
			}
		}, ((BadRequestObjectResult) result).Value);
	}


	[Fact]
	public void GetProject_ReturnsAssignedTasks_WhenValidID() {
		const int validId = 1;
		Project p = _context.Projects.Include(x => x.Tasks).First(x => x.ProjectId == validId);

		IActionResult result = _sut.GetProject(validId);

		Assert.Equal(3, p.Tasks.Count);
		Assert.Equivalent(new {
			Tasks = p.Tasks.Select(t => new {
				t.TaskId,
				t.Name,
				t.IsCompleted,
				t.TrackedMillis,
				t.IsParentTask
			})
		}, ((OkObjectResult)result).Value);
	}


	[Fact]
	public void GetProject_ResponseSumsTrackedTimeOfTasksAndSubtasks_WhenTaskIsParentTask() {
		const int IdOfProjectWithTasksWithSubtasks = 1;
		ICollection<Task> tasks = _context.Projects.Find(IdOfProjectWithTasksWithSubtasks).Tasks;
		int expectedTrackedTime = tasks.Sum(t => t.TimeRecords.Sum(tr => tr.TrackedMillis));

		IActionResult result = _sut.GetProject(IdOfProjectWithTasksWithSubtasks);

		Assert.Equivalent(new {
			TrackedMillis = expectedTrackedTime
		}, ((OkObjectResult) result).Value);
	}


	[Fact]
	public void CreateProject_ReturnsCreatedProjectWithLocation_WhenValidProject() {
		Project project = new () {
			Name = "Test Project",
			Description = "Test Description",
			IsCompleted = false,
			Deadline = DateTime.Now
		};

		IActionResult result = _sut.CreateProject(project);

		Assert.IsType<CreatedAtActionResult>(result);
		Assert.IsAssignableFrom<Project>(((CreatedAtActionResult) result).Value);
		Assert.Equal(project, ((CreatedAtActionResult) result).Value);
		Assert.Equal("GetProject", ((CreatedAtActionResult) result).ActionName);
		Assert.Equal(project.ProjectId, ((CreatedAtActionResult) result).RouteValues["projectId"]);
	}


	[Fact]
	public void CreateProject_ReturnsBadRequestWithProps_WhenInvalidProject() {
		Project project = new ();

		IActionResult result = _sut.CreateProject(project);

		Assert.IsType<BadRequestObjectResult>(result);
		Assert.Equivalent(new {
			Code = "VAL-400",
			Cause = "Validation failed",
			Errors = new []{
				new {
					Name = "Name",
					Error = "Projects must have a name."
				},
				new {
					Name = "Deadline",
					Error = "Projects must have a deadline."
				}
			}
		}, ((BadRequestObjectResult) result).Value);
	}


	// TODO: Update not updating
	// [Fact]
	// public void UpdateProject_UpdatesEntryWithDefinedProperties_WhenValidProject() {
	// 	const int projectId = 1;
	// 	Project pre_update = new() {
	// 		Name = _context.Projects.Find(projectId).Name,
	// 		Description = "",
	// 		IsCompleted = _context.Projects.Find(projectId).IsCompleted
	// 	};
	//
	// 	Project new_project = new() {
	// 		ProjectId = projectId,
	// 		Description = "Updated Project",
	// 		IsCompleted = null
	// 	};
	//
	// 	_sut.UpdateProject(new_project, projectId);
	// 	_context.Entry(_context.Projects.Find(projectId)).Reload();									 // Happens automatically in real scenario
	//
	// 	Project post_update = _context.Projects.Find(projectId);
	//
	// 	Assert.Equal(new_project.Description, post_update.Description);								 // Description was provided and updated
	// 	Assert.Equal(pre_update.Name, post_update.Name);											 // Name was not provided and remains the same
	// }


	[Fact]
	public void UpdateProject_ReturnsBadRequestWithProps_WhenInvalidProject() {
		Project project = new ();

		IActionResult result = _sut.UpdateProject(project, 1);

		Assert.IsType<BadRequestObjectResult>(result);
		Assert.Equivalent(new {
			Code = "VAL-400",
			Cause = "Validation failed",
		}, ((BadRequestObjectResult) result).Value);
	}


	[Fact]
	public void UpdateProject_ReturnsNotFoundWithProps_WhenInvalidID() {
		Project project = new ();

		IActionResult result = _sut.UpdateProject(project, 100);

		Assert.IsType<BadRequestObjectResult>(result);
		Assert.Equivalent(new {
			Code = "ID-404",
			Cause = "ID not found",
			Errors = new [] {
				new {
					Name = "ProjectId",
					Error = "Project with ID 100 does not exist."
				}
			}
		}, ((BadRequestObjectResult) result).Value);
	}


	[Fact]
	public void DeleteProject_DeletesProject_WhenValidID() {
		const int validId = 1;

		_sut.DeleteProject(validId);
		Assert.Null(_context.Projects.Find(validId));
	}


	[Fact]
	public void DeleteProject_ReturnsErrorWithProps_WhenInvalidID() {
		const int invalidId = 100;

		IActionResult result = _sut.DeleteProject(invalidId);

		Assert.IsType<BadRequestObjectResult>(result);
		Assert.Equivalent(new {
			Code = "ID-404",
			Cause = "ID not found",
			Errors = new [] {
				new {
					Name = "ProjectId",
					Error = "Project with ID 100 does not exist."
				}
			}
		}, ((BadRequestObjectResult) result).Value);
	}


	[Fact]
	public void DeleteProject_CascadeDeletesTasks_WhenValidID() {
		const int validId = 1;
		int attachedTasks = _context.Projects.Find(validId).Tasks.Count;

		_sut.DeleteProject(validId);
		Assert.NotEqual(0, attachedTasks);
		Assert.Empty(_context.Tasks.Where(t => t.ProjectId == validId));
	}
}