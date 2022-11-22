using System.Collections.Generic;
using System.Linq;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Query;
using Timelogger.Entities;

namespace Timelogger.Api.Controllers;

[ApiController]
public class RouteRequestsController : Controller {
	private readonly ApiContext _context;

	public RouteRequestsController(ApiContext context) {
		_context = context;
	}

	/// <summary>
	/// Gets active projects and open tasks (with subtasks) for the home view<br/>
	/// GET api/home
	/// </summary>
	/// <returns>
	/// A list of <see cref="Project"/> instances, where <see cref="Project.IsCompleted"/> is
	/// <c>false</c>, its respective <see cref="Task"/> instances, where <see cref="Task.IsCompleted"/>
	/// is <c>false</c>, and the <see cref="Task"/> instances' respective subtasks.
	/// </returns>
	[Route("/api/home")]
	[HttpGet]
	public IActionResult Get() {
		var query =
			_context.Projects
			        .Include(p => p.Tasks)
			        .ThenInclude(t => t.TimeRecords)
			        .Include(p => p.Tasks)
			        .ThenInclude(t => t.Subtasks)
			        .ThenInclude(st => st.TimeRecords);

		var res = query.Where(p => p != null && !p.IsCompleted)
		               .Select(p => new {
				               p.ProjectId,
				               p.Name,
				               p.Deadline,
				               p.TrackedMillis,
				               p.IsCompleted,
				               Tasks = p.Tasks
				                        .Where(t => t.ParentTaskId == null
				                                    && t.IsCompleted != null
				                                    && !(bool)t.IsCompleted)
				                        .Select(t => new {
						                        t.Name,
						                        t.TaskId,
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
				                        )
			               }
		               )
		               .OrderBy(d => d.Deadline);

		return Ok(res);
	}
}