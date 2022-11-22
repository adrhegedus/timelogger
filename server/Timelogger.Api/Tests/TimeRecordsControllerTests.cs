using System;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Timelogger.Api.Controllers;
using Timelogger.Entities;
using Xunit;

namespace Timelogger.Api.Tests;

public class TimeRecordsControllerTests {
	private readonly TimeController _sut;
	private readonly ApiContext _context = new (new DbContextOptionsBuilder<ApiContext>()
	                                            .UseInMemoryDatabase("TestDb").Options);

	public TimeRecordsControllerTests() {
		Utility.SeedDatabase(_context);
		_sut = new TimeController(_context);
	}


	[Fact]
	public void GetTimeRecord_ReturnsTimeRecord_WhenValidID() {
		const int validId = 1;

		IActionResult result = _sut.GetTime(validId);
		Assert.NotNull(result);
	}


	[Fact]
	public void GetTimeRecord_ReturnsBadRequestWithProps_WhenInvalidID() {
		const int invalidId = 100;
		IActionResult result = _sut.GetTime(invalidId);

		Assert.IsType<BadRequestObjectResult>(result);
		Assert.Equivalent(new {
			Code = "ID-404",
			Cause = "ID not found",
			Errors = new [] {
				new {
					Name = "TimeRecordId",
					Error = "Time record with ID 100 does not exist."
				}
			}
		}, ((BadRequestObjectResult) result).Value);
	}


	[Fact]
	public void CreateTimeRecord_ReturnsCreatedTimeRecordWithLocation_WhenValidTimeRecord() {
		TimeRecord timeRecord = new () {
			StartTime = DateTime.Now,
			EndTime = DateTime.Now.AddHours(1),
			TaskId = 1
		};

		IActionResult result = _sut.CreateTime(timeRecord);

		Assert.IsType<CreatedAtActionResult>(result);
		Assert.Equal(timeRecord, ((CreatedAtActionResult) result).Value);
		Assert.Equal("GetTime", ((CreatedAtActionResult) result).ActionName);
		Assert.Equal(timeRecord.TimeRecordId, ((CreatedAtActionResult) result).RouteValues["timeRecordId"]);
	}


	[Fact]
	public void CreateTimeRecord_ReturnsBadRequestWithProps_WhenInvalidTimeRecord() {
		TimeRecord timeRecord = new ();

		IActionResult result = _sut.CreateTime(timeRecord);

		Assert.IsType<BadRequestObjectResult>(result);
		Assert.Equivalent(new {
			Code = "VAL-400",
			Cause = "Validation failed"
		}, ((BadRequestObjectResult) result).Value);
	}


	[Fact]
	public void CreateTimeRecord_ReturnsBadRequestWithProps_WhenTimeDifferenceLessThan30Mins() {
		TimeRecord timeRecord = new () {
			StartTime = DateTime.Now,
			EndTime = DateTime.Now.AddMinutes(29),
			TaskId = 1
		};

		IActionResult result = _sut.CreateTime(timeRecord);

		Assert.IsType<BadRequestObjectResult>(result);
		Assert.Equivalent(new {
			Code = "VAL-400",
			Cause = "Validation failed",
			Errors = new [] {
				new {
					Name = "Duration",
					Error = "Time record must be at least 30 minutes long."
				}
			}
		}, ((BadRequestObjectResult)result).Value, strict: true);
	}


	[Fact]
	public void CreateTimeRecord_ReturnsBadRequestWithProps_WhenEndTimeBeforeStartTime() {
		TimeRecord timeRecord = new () {
			StartTime = DateTime.Now,
			EndTime = DateTime.Now.AddHours(-1),
			TaskId = 1
		};

		IActionResult result = _sut.CreateTime(timeRecord);

		Assert.IsType<BadRequestObjectResult>(result);
		Assert.Equivalent(new {
			Code = "VAL-400",
			Cause = "Validation failed",
			Errors = new [] {
				new {
					Name = "Chronology",
					Error = "Start time must be before end time."
				}
			}
		}, ((BadRequestObjectResult)result).Value, strict: true);
	}


	[Fact]
	public void CreateTimeRecord_Rejects_WhenProjectIsCompleted() {
		Task task = _context.Tasks.Find(3);
		Project completedProject = _context.Projects.Find(task.ProjectId);

		TimeRecord timeRecord = new () {
			StartTime = DateTime.Now,
			EndTime = DateTime.Now.AddHours(1),
			TaskId = task.TaskId
		};

		IActionResult result = _sut.CreateTime(timeRecord);

		Assert.True(completedProject.IsCompleted);
		Assert.IsType<BadRequestObjectResult>(result);
	}


	[Fact]
	public void UpdateTimeRecord_ReturnsBadRequestWithProps_WhenInvalidTimeRecord() {
		TimeRecord timeRecord = new ();

		IActionResult result = _sut.UpdateTime(timeRecord, 1);

		Assert.IsType<BadRequestObjectResult>(result);
		Assert.Contains("Code = VAL-400, Cause = Validation failed, Errors = ",
		                ((BadRequestObjectResult)result).Value.ToString());
	}


	[Fact]
	public void UpdateTimeRecord_ReturnsBadRequestWithProps_WhenInvalidID() {
		TimeRecord timeRecord = new ();

		IActionResult result = _sut.UpdateTime(timeRecord, 100);

		Assert.IsType<BadRequestObjectResult>(result);
		Assert.Equivalent(new {
			Code = "ID-404",
			Cause = "ID not found",
			Errors = new [] {
				new {
					Name = "TimeRecordId",
					Error = "Time record with ID 100 does not exist."
				}
			}
		}, ((BadRequestObjectResult) result).Value);
	}


	[Fact]
	public void DeleteTimeRecord_DeletesTimeRecord_WhenValidID() {
		const int validId = 1;

		_sut.DeleteTime(validId);
		Assert.Null(_context.TimeRecords.Find(validId));
	}


	[Fact]
	public void DeleteTimeRecord_ReturnsErrorWithProps_WhenInvalidID() {
		const int invalidId = 100;

		IActionResult result = _sut.DeleteTime(invalidId);

		Assert.IsType<BadRequestObjectResult>(result);
		Assert.Equivalent(new {
			Code = "ID-404",
			Cause = "ID not found",
			Errors = new [] {
				new {
					Name = "TimeRecordId",
					Error = "Time record with ID 100 does not exist."
				}
			}
		}, ((BadRequestObjectResult) result).Value);
	}
}