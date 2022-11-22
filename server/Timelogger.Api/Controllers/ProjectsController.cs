using System;
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
public class ProjectsController : Controller {
	private readonly ApiContext _context;

	public ProjectsController(ApiContext context) {
		_context = context;
	}


	// Get all projects (f/e: /projects)
	// GET api/projects/all
	[HttpGet("all")]
	public IActionResult GetProjects() {
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
				               p.TrackedMillis,
				               p.IsCompleted,
			               }
		               )
		               .OrderBy(p => p.IsCompleted)
		               .ThenBy(p => p.Deadline);

		return Ok(res);
	}


	// Get specific project by ID (f/e: /projects/{projectId})
	// GET api/projects?projectId={projectId}
	[HttpGet(Name = "GetProject")]
	public IActionResult GetProject(int projectId) {
		Project p =
			_context.Projects
			        .Include(p => p.Tasks)
			        .ThenInclude(t => t.TimeRecords)
			        .Include(p => p.Tasks)
			        .ThenInclude(t => t.Subtasks)
			        .ThenInclude(st => st.TimeRecords)
			        .SingleOrDefault(p => p.ProjectId == projectId);

		// If project not found
		if (p == null) {
			return BadRequest(new {
				Code = "ID-404",
				Cause = "ID not found",
				Errors = new [] {
					new {
						Name = "ProjectId",
						Error = $"Project with ID {projectId} does not exist."
					}
				}
			});
		}

		List<IGrouping<DateTime, TimeRecord>> allTimeRecords = p.Tasks.SelectMany(t => t.TimeRecords)
		                                                        .Concat(p.Tasks.SelectMany(t => t.Subtasks)
																			   .SelectMany(st => st.TimeRecords))
		                                                        .Distinct()
		                                                        .GroupBy(tr => tr.StartTime.Date)
		                                                        .OrderByDescending(g => g.Key)
		                                                        .ToList();

		var res = new {
			p.ProjectId,
			p.Name,
			p.Description,
			p.Deadline,
			p.TrackedMillis,
			p.IsCompleted,
			Tasks = p.Tasks
			         .Where(t => t.ParentTaskId == null)
			         .Select(t => new {
					         t.TaskId,
					         t.Name,
					         t.IsCompleted,
					         TrackedMillis = t.OwnTrackedMillis,
					         t.IsParentTask,
					         Subtasks = t.Subtasks.Select( st => new {
							         st.TaskId,
							         st.Name,
							         st.IsCompleted,
							         st.IsParentTask,
							         ParentTaskId = t.TaskId,
							         IsSubtask = true,
							         TrackedMillis = st.OwnTrackedMillis,
					         })
				         }
			         ),
			TimeRecordsByDate = allTimeRecords.Select(tr => new {
				Date = tr.Key,
				Time = tr.Sum(t => t.TrackedMillis)
			})
		};

		return Ok(res);
	}


	// Create project (f/e: ProjectsForm)
	// POST api/projects/create
	[HttpPost("create")]
	public IActionResult CreateProject([FromBody] Project project) {
		ProjectValidator validator = new();
		ValidationResult result = validator.Validate(project);

		// If validation fails
		if (!result.IsValid) {
			return BadRequest(new {
				Code = "VAL-400",
				Cause = "Validation failed",
				Errors = result.Errors.Select(e => new {
					Name = e.PropertyName,
					Error = e.ErrorMessage
				})
			});
		}

		_context.Projects.Add(project);
		_context.SaveChanges();

		return CreatedAtAction(nameof(GetProject), new {projectId = project.ProjectId}, project);
	}


	// Update project (f/e: ProjectsForm)
	// PUT api/projects/update?projectId=1
	[HttpPut("update")]
	public IActionResult UpdateProject([FromBody] Project project, int projectId) {
		Project projectToUpdate = _context.Projects.Find(projectId);

		// If project not found
		if ( projectToUpdate == null ) {
			return BadRequest(new {
				Code = "ID-404",
				Cause = "ID not found",
				Errors = new [] {
					new {
						Name = "ProjectId",
						Error = $"Project with ID {projectId} does not exist."
					}
				}
			});
		}

		ProjectValidator validator = new();
		ValidationResult result = validator.Validate(project);

		// If validation fails
		if (!result.IsValid) {
			return BadRequest(new {
				Code = "VAL-400",
				Cause = "Validation failed",
				Errors = result.Errors.Select(e => new {
					Name = e.PropertyName,
					Error = e.ErrorMessage
				})
			});
		}

		// Update project with provided properties
		projectToUpdate.Name = project.Name ?? projectToUpdate.Name;
		projectToUpdate.Description = project.Description ?? projectToUpdate.Description;
		projectToUpdate.Deadline = project.Deadline == DateTime.MinValue 
			? projectToUpdate.Deadline
			: project.Deadline;
		projectToUpdate.IsCompleted = projectToUpdate.IsCompleted;

		_context.SaveChanges();

		return NoContent();
	}


	// Delete project (f/e: DeleteConfirmation)
	// DELETE api/projects/delete?projectId=1
	[HttpDelete("delete")]
	public IActionResult DeleteProject(int projectId) {
		Project projectToDelete = _context.Projects.Find(projectId);

		// If project not found
		if ( projectToDelete == null ) {
			return BadRequest(new {
				Code = "ID-404",
				Cause = "ID not found",
				Errors = new [] {
					new {
						Name = "ProjectId",
						Error = $"Project with ID {projectId} does not exist."
					}
				}
			});
		}

		// Delete project
		_context.Projects.Remove(projectToDelete);
		_context.SaveChanges();

		return NoContent();
	}
}