using System.Linq;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Timelogger.Entities;

namespace Timelogger.Api.Controllers;

/// <summary>
/// Controller handling requests for Create/Update forms, where names of other entities are needed.
/// </summary>
[ApiController]
[Route("api/[controller]")]
public class NamesController : Controller {
	private readonly ApiContext _context;

	public NamesController(ApiContext context) {
		_context = context;
	}


	/// <summary>
	/// Get names for tasks' Create/Update form<br/>
	/// GET api/names/tasks
	/// </summary>
	/// <returns>
	/// A list of <see cref="Project"/> names and corresponding IDs, and
	/// a list of <see cref="Task"/> names, and corresponding IDs and parent project names.
	/// </returns>
	[HttpGet("tasks")]
	public IActionResult GetNamesForTaskCrUp() {
		var projects = _context.Projects.Select(p => new { p.ProjectId, p.Name }).ToList();
		var tasks = _context.Tasks.Where(t => t.ParentTaskId == null)
		                    .Select(t => new {
			                    t.TaskId,
			                    t.Name,
			                    t.ProjectId,
			                    Project = new { t.Project.Name }
		                    }).ToList();

		return Ok(new { projects, tasks });
	}


	/// <summary>
	/// Get names for time records' Create/Update form<br/>
	/// GET api/names/time
	/// </summary>
	/// <returns>
	/// A list of <see cref="Task"/> names, and corresponding IDs and parent project names.
	/// </returns>
	[HttpGet("time")]
	public IActionResult GetNamesForTimeCrUp() {
		var res = _context.Tasks
		                  .Include(t => t.Project)
		                  .Select(t => new {
			                  t.TaskId,
			                  t.Name,
			                  Project = new {
				                  t.Project.Name,
				                  t.Project.IsCompleted
			                  }
		                  }).ToList();

		return Ok(res);
	}
}