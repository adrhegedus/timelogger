using System;
using Microsoft.Extensions.DependencyInjection;
using Timelogger.Entities;

namespace Timelogger.Api;

public partial class Startup {
	private static void SeedDatabase(IServiceScope scope) {
		ApiContext context = scope.ServiceProvider.GetService<ApiContext>();

		#region Projects
		Project testProject1 = new() {
			ProjectId = 1,
			Name = "e-conomic Interview",
			Description = "A timelogger project to showcase skills for the position at Visma e-conomic.",
			Deadline = new DateTime(2022, 11, 17),
			IsCompleted = false
		};
		Project testProject2 = new() {
			ProjectId = 2,
			Name = "Project 2",
			Description = "Lorem ipsum dolor sit amet, consectetur adipiscing elit.",
			Deadline = new DateTime(2022, 12, 01),
			IsCompleted = false
		};
		Project testProject3 = new() {
			ProjectId = 3,
			Name = "Project 3",
			Deadline = new DateTime(2022, 11, 01),
			IsCompleted = true
		};

		context.Projects.Add(testProject1);
		context.Projects.Add(testProject2);
		context.Projects.Add(testProject3);

		#endregion
		// --------------------------------------------------


		#region Tasks
		Task testTask1 = new() {
			TaskId = 1,
			ProjectId = 1,
			Name = "Work on this",
			IsCompleted = false
		};
		Task testTask2 = new() {
			TaskId = 2,
			ProjectId = 1,
			Name = "Work on that",
			IsCompleted = false
		};
		Task testTask3 = new() {
			TaskId = 3,
			ProjectId = 3,
			Name = "Work on another thing",
			IsCompleted = true
		};
		Task testTask4 = new() {
			TaskId = 4,
			ProjectId = 2,
			Name = "Work on that other thing",
			IsCompleted = true
		};
		Task testTask5 = new() {
			TaskId = 5,
			ProjectId = 1,
			Name = "Some sublevel task",
			IsCompleted = false,
			ParentTaskId = 2
		};

		context.Tasks.Add(testTask1);
		context.Tasks.Add(testTask2);
		context.Tasks.Add(testTask3);
		context.Tasks.Add(testTask4);
		context.Tasks.Add(testTask5);

		#endregion
		// --------------------------------------------------


		#region Time records
		TimeRecord testTimeRecord1 = new() {
			TimeRecordId = 1,
			TaskId = 1,
			StartTime = new DateTime(2022, 11, 06, 11, 00, 00),
			EndTime = new DateTime(2022, 11, 06, 12, 20, 00)
		};
		TimeRecord testTimeRecord2 = new() {
			TimeRecordId = 2,
			TaskId = 1,
			StartTime = new DateTime(2022, 11, 07, 13, 04, 00),
			EndTime = new DateTime(2022, 11, 07, 19, 10, 00)
		};
		TimeRecord testTimeRecord3 = new() {
			TimeRecordId = 3,
			TaskId = 3,
			StartTime = new DateTime(2022, 10, 11, 08, 00, 00),
			EndTime = new DateTime(2022, 10, 11, 16, 40, 00)
		};
		TimeRecord testTimeRecord4 = new() {
			TimeRecordId = 4,
			TaskId = 3,
			StartTime = new DateTime(2022, 10, 12, 08, 05, 00),
			EndTime = new DateTime(2022, 10, 12, 16, 25, 00)
		};
		TimeRecord testTimeRecord5 = new() {
			TimeRecordId = 5,
			TaskId = 4,
			StartTime = new DateTime(2022, 10, 13, 08, 00, 00),
			EndTime = new DateTime(2022, 10, 13, 16, 40, 00)
		};
		TimeRecord testTimeRecord6 = new() {
			TimeRecordId = 6,
			TaskId = 5,
			StartTime = new DateTime(2022, 10, 14, 08, 00, 00),
			EndTime = new DateTime(2022, 10, 14, 08, 30, 00)
		};

		context.TimeRecords.Add(testTimeRecord1);
		context.TimeRecords.Add(testTimeRecord2);
		context.TimeRecords.Add(testTimeRecord3);
		context.TimeRecords.Add(testTimeRecord4);
		context.TimeRecords.Add(testTimeRecord5);
		context.TimeRecords.Add(testTimeRecord6);

		#endregion
		// --------------------------------------------------


		context.SaveChanges();
	}
}