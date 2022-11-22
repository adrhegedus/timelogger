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
public class TimeController : Controller {
	private readonly ApiContext _context;

	public TimeController(ApiContext context) {
		_context = context;
	}


	// Get all time (f/e: /time)
	// GET api/time/all
	[HttpGet("all")]
	public IActionResult GetTime() {
		var query =
			_context.TimeRecords
			        .Include(tr => tr.Task)
			        .ThenInclude(t => t.Project);

		var res = query.Select(tr => new {
				               tr.TimeRecordId,
				               tr.StartTime,
				               tr.EndTime,
				               Duration = tr.TrackedMillis,
				               Task = new {
					               tr.Task.TaskId,
					               tr.Task.Name,
					               Project = new {
						               tr.Task.Project.Name,
						               tr.Task.Project.ProjectId
					               }
				               }
			               }
		               )
		               .OrderBy(tr => tr.StartTime);

		return Ok(res);
	}


	// Get specific time by ID (f/e: /time/{timeRecordId})
	// GET api/time?timeRecordId={timeRecordId}
	[HttpGet(Name = "GetTime")]
	public IActionResult GetTime(int timeRecordId) {
		TimeRecord tr =
			_context.TimeRecords
			        .Include(tr => tr.Task)
			        .ThenInclude(t => t.Project)
			        .SingleOrDefault(tr => tr.TimeRecordId == timeRecordId);

		// If time record not found
		if ( tr == null ) {
			return BadRequest(new {
				Code = "ID-404",
				Cause = "ID not found",
				Errors = new [] {
					new {
						Name = "TimeRecordId",
						Error = $"Time record with ID {timeRecordId} does not exist."
					}
				}
			});
		}

		var res = new {
			tr.TimeRecordId,
			tr.StartTime,
			tr.EndTime,
			Duration = (int)tr.Duration.TotalMilliseconds,
			Task = new {
				tr.Task.TaskId,
				tr.Task.Name,
				Project = new {
					tr.Task.Project.Name,
					tr.Task.Project.ProjectId
				}
			}
		};

		return Ok(res);
	}


	// Create time record (f/e: TimeRecordForm)
	// POST api/time/create
	[HttpPost("create")]
	public IActionResult CreateTime([FromBody] TimeRecord timeRecord) {
		TimeRecordValidator validator = new(_context);
		ValidationResult result = validator.Validate(timeRecord);

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

		_context.TimeRecords.Add(timeRecord);
		_context.SaveChanges();

		return CreatedAtAction(nameof(GetTime), new {timeRecordId = timeRecord.TimeRecordId}, timeRecord);
	}


	// Update time record (f/e: TimeRecordForm)
	// PUT api/time/update?timeId=1
	[HttpPut("update")]
	public IActionResult UpdateTime([FromBody] TimeRecord timeRecord, int timeRecordId) {
		TimeRecord timeToUpdate = _context.TimeRecords.Find(timeRecordId);

		// If time not found
		if (timeToUpdate == null) {
			return BadRequest(new {
				Code = "ID-404",
				Cause = "ID not found",
				Errors = new [] {
					new {
						Name = "TimeRecordId",
						Error = $"Time record with ID {timeRecordId} does not exist."
					}
				}
			});
		}

		TimeRecordValidator validator = new(_context);
		ValidationResult result = validator.Validate(timeRecord);

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

		// Update time
		timeToUpdate.StartTime = timeRecord.StartTime;
		timeToUpdate.EndTime = timeRecord.EndTime;
		timeToUpdate.TaskId = timeRecord.TaskId;
		timeToUpdate.Note = timeRecord.Note;
		_context.SaveChanges();

		return NoContent();
	}


	// Delete time record
	// DELETE api/time/delete?timeId=1
	[HttpDelete("delete")]
	public IActionResult DeleteTime(int timeRecordId) {
		TimeRecord timeToDelete = _context.TimeRecords.Find(timeRecordId);

		// If time not found
		if (timeToDelete == null) {
			return BadRequest(new {
				Code = "ID-404",
				Cause = "ID not found",
				Errors = new [] {
					new {
						Name = "TimeRecordId",
						Error = $"Time record with ID {timeRecordId} does not exist."
					}
				}
			});
		}

		_context.TimeRecords.Remove(timeToDelete);
		_context.SaveChanges();

		return NoContent();
	}
}