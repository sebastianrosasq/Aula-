CREATE TABLE `alerts` (
	`id` varchar(36) NOT NULL,
	`student_id` varchar(36) NOT NULL,
	`created_by_id` varchar(36) NOT NULL,
	`title` varchar(180) NOT NULL,
	`description` varchar(700) NOT NULL,
	`level` enum('informativa','atencion','urgente') NOT NULL DEFAULT 'informativa',
	`resolved_at` timestamp,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `alerts_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `attendance_records` (
	`id` varchar(36) NOT NULL,
	`classroom_id` varchar(36) NOT NULL,
	`student_id` varchar(36) NOT NULL,
	`recorded_by_id` varchar(36) NOT NULL,
	`attendance_date` date NOT NULL,
	`status` enum('presente','tardanza','ausente','justificado') NOT NULL,
	`note` varchar(500),
	`created_at` timestamp NOT NULL DEFAULT (now()),
	`updated_at` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `attendance_records_id` PRIMARY KEY(`id`),
	CONSTRAINT `attendance_student_day_unique` UNIQUE(`classroom_id`,`student_id`,`attendance_date`)
);
--> statement-breakpoint
CREATE TABLE `classrooms` (
	`id` varchar(36) NOT NULL,
	`institution_id` varchar(36) NOT NULL,
	`name` varchar(120) NOT NULL,
	`grade` varchar(40) NOT NULL,
	`section` varchar(20) NOT NULL,
	`academic_year` int NOT NULL,
	`active` boolean NOT NULL DEFAULT true,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `classrooms_id` PRIMARY KEY(`id`),
	CONSTRAINT `classrooms_year_grade_section_unique` UNIQUE(`institution_id`,`academic_year`,`grade`,`section`)
);
--> statement-breakpoint
CREATE TABLE `competencies` (
	`id` varchar(36) NOT NULL,
	`subject_id` varchar(36) NOT NULL,
	`name` varchar(240) NOT NULL,
	`description` text,
	`active` boolean NOT NULL DEFAULT true,
	CONSTRAINT `competencies_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `competency_results` (
	`id` varchar(36) NOT NULL,
	`evaluation_id` varchar(36) NOT NULL,
	`student_id` varchar(36) NOT NULL,
	`level` enum('AD','A','B','C') NOT NULL,
	`observation` varchar(700),
	`updated_at` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `competency_results_id` PRIMARY KEY(`id`),
	CONSTRAINT `competency_result_student_unique` UNIQUE(`evaluation_id`,`student_id`)
);
--> statement-breakpoint
CREATE TABLE `descriptive_conclusions` (
	`id` varchar(36) NOT NULL,
	`student_id` varchar(36) NOT NULL,
	`subject_id` varchar(36) NOT NULL,
	`period` varchar(80) NOT NULL,
	`content` text NOT NULL,
	`status` enum('borrador','publicada') NOT NULL DEFAULT 'borrador',
	`author_id` varchar(36) NOT NULL,
	`updated_at` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `descriptive_conclusions_id` PRIMARY KEY(`id`),
	CONSTRAINT `conclusions_student_subject_period_unique` UNIQUE(`student_id`,`subject_id`,`period`)
);
--> statement-breakpoint
CREATE TABLE `enrollments` (
	`id` varchar(36) NOT NULL,
	`student_id` varchar(36) NOT NULL,
	`classroom_id` varchar(36) NOT NULL,
	`enrolled_at` timestamp NOT NULL DEFAULT (now()),
	`active` boolean NOT NULL DEFAULT true,
	CONSTRAINT `enrollments_id` PRIMARY KEY(`id`),
	CONSTRAINT `enrollments_student_classroom_unique` UNIQUE(`student_id`,`classroom_id`)
);
--> statement-breakpoint
CREATE TABLE `evaluations` (
	`id` varchar(36) NOT NULL,
	`assignment_id` varchar(36) NOT NULL,
	`competency_id` varchar(36) NOT NULL,
	`title` varchar(200) NOT NULL,
	`evaluation_date` date NOT NULL,
	`created_by_id` varchar(36) NOT NULL,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `evaluations_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `guardian_profiles` (
	`user_id` varchar(36) NOT NULL,
	`phone` varchar(30),
	CONSTRAINT `guardian_profiles_user_id` PRIMARY KEY(`user_id`)
);
--> statement-breakpoint
CREATE TABLE `guardian_students` (
	`id` varchar(36) NOT NULL,
	`guardian_id` varchar(36) NOT NULL,
	`student_id` varchar(36) NOT NULL,
	`relationship` varchar(50) NOT NULL,
	`primary_contact` boolean NOT NULL DEFAULT false,
	CONSTRAINT `guardian_students_id` PRIMARY KEY(`id`),
	CONSTRAINT `guardian_student_unique` UNIQUE(`guardian_id`,`student_id`)
);
--> statement-breakpoint
CREATE TABLE `institutions` (
	`id` varchar(36) NOT NULL,
	`name` varchar(180) NOT NULL,
	`modular_code` varchar(30),
	`active` boolean NOT NULL DEFAULT true,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	`updated_at` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `institutions_id` PRIMARY KEY(`id`),
	CONSTRAINT `institutions_modular_code_unique` UNIQUE(`modular_code`)
);
--> statement-breakpoint
CREATE TABLE `messages` (
	`id` varchar(36) NOT NULL,
	`institution_id` varchar(36) NOT NULL,
	`sender_id` varchar(36) NOT NULL,
	`recipient_id` varchar(36) NOT NULL,
	`student_id` varchar(36),
	`subject` varchar(180) NOT NULL,
	`body` text NOT NULL,
	`read_at` timestamp,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `messages_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `notifications` (
	`id` varchar(36) NOT NULL,
	`user_id` varchar(36) NOT NULL,
	`type` varchar(70) NOT NULL,
	`title` varchar(180) NOT NULL,
	`body` varchar(500) NOT NULL,
	`href` varchar(300),
	`read_at` timestamp,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `notifications_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `schedule_slots` (
	`id` varchar(36) NOT NULL,
	`assignment_id` varchar(36) NOT NULL,
	`day_of_week` int NOT NULL,
	`starts_at` time NOT NULL,
	`ends_at` time NOT NULL,
	`room` varchar(80),
	CONSTRAINT `schedule_slots_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `sessions` (
	`id` varchar(36) NOT NULL,
	`user_id` varchar(36) NOT NULL,
	`token_hash` varchar(64) NOT NULL,
	`expires_at` timestamp NOT NULL,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `sessions_id` PRIMARY KEY(`id`),
	CONSTRAINT `sessions_token_unique` UNIQUE(`token_hash`)
);
--> statement-breakpoint
CREATE TABLE `student_profiles` (
	`user_id` varchar(36) NOT NULL,
	`student_code` varchar(40) NOT NULL,
	`birth_date` date,
	`active` boolean NOT NULL DEFAULT true,
	CONSTRAINT `student_profiles_user_id` PRIMARY KEY(`user_id`),
	CONSTRAINT `student_profiles_code_unique` UNIQUE(`student_code`)
);
--> statement-breakpoint
CREATE TABLE `subjects` (
	`id` varchar(36) NOT NULL,
	`institution_id` varchar(36) NOT NULL,
	`name` varchar(120) NOT NULL,
	`color` varchar(12) NOT NULL DEFAULT '#0F9D94',
	`active` boolean NOT NULL DEFAULT true,
	CONSTRAINT `subjects_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `teacher_assignments` (
	`id` varchar(36) NOT NULL,
	`teacher_id` varchar(36) NOT NULL,
	`classroom_id` varchar(36) NOT NULL,
	`subject_id` varchar(36) NOT NULL,
	`active` boolean NOT NULL DEFAULT true,
	CONSTRAINT `teacher_assignments_id` PRIMARY KEY(`id`),
	CONSTRAINT `teacher_assignment_unique` UNIQUE(`teacher_id`,`classroom_id`,`subject_id`)
);
--> statement-breakpoint
CREATE TABLE `teacher_profiles` (
	`user_id` varchar(36) NOT NULL,
	`staff_code` varchar(40),
	`specialty` varchar(120),
	CONSTRAINT `teacher_profiles_user_id` PRIMARY KEY(`user_id`)
);
--> statement-breakpoint
CREATE TABLE `users` (
	`id` varchar(36) NOT NULL,
	`institution_id` varchar(36) NOT NULL,
	`email` varchar(190) NOT NULL,
	`password_hash` varchar(255) NOT NULL,
	`role` enum('admin','docente','estudiante','padre') NOT NULL,
	`first_name` varchar(100) NOT NULL,
	`last_name` varchar(120) NOT NULL,
	`active` boolean NOT NULL DEFAULT true,
	`last_login_at` timestamp,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	`updated_at` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `users_id` PRIMARY KEY(`id`),
	CONSTRAINT `users_email_unique` UNIQUE(`email`)
);
--> statement-breakpoint
ALTER TABLE `alerts` ADD CONSTRAINT `alerts_student_id_student_profiles_user_id_fk` FOREIGN KEY (`student_id`) REFERENCES `student_profiles`(`user_id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `alerts` ADD CONSTRAINT `alerts_created_by_id_users_id_fk` FOREIGN KEY (`created_by_id`) REFERENCES `users`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `attendance_records` ADD CONSTRAINT `attendance_records_classroom_id_classrooms_id_fk` FOREIGN KEY (`classroom_id`) REFERENCES `classrooms`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `attendance_records` ADD CONSTRAINT `attendance_records_student_id_student_profiles_user_id_fk` FOREIGN KEY (`student_id`) REFERENCES `student_profiles`(`user_id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `attendance_records` ADD CONSTRAINT `attendance_records_recorded_by_id_users_id_fk` FOREIGN KEY (`recorded_by_id`) REFERENCES `users`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `classrooms` ADD CONSTRAINT `classrooms_institution_id_institutions_id_fk` FOREIGN KEY (`institution_id`) REFERENCES `institutions`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `competencies` ADD CONSTRAINT `competencies_subject_id_subjects_id_fk` FOREIGN KEY (`subject_id`) REFERENCES `subjects`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `competency_results` ADD CONSTRAINT `competency_results_evaluation_id_evaluations_id_fk` FOREIGN KEY (`evaluation_id`) REFERENCES `evaluations`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `competency_results` ADD CONSTRAINT `competency_results_student_id_student_profiles_user_id_fk` FOREIGN KEY (`student_id`) REFERENCES `student_profiles`(`user_id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `descriptive_conclusions` ADD CONSTRAINT `descriptive_conclusions_student_id_student_profiles_user_id_fk` FOREIGN KEY (`student_id`) REFERENCES `student_profiles`(`user_id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `descriptive_conclusions` ADD CONSTRAINT `descriptive_conclusions_subject_id_subjects_id_fk` FOREIGN KEY (`subject_id`) REFERENCES `subjects`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `descriptive_conclusions` ADD CONSTRAINT `descriptive_conclusions_author_id_users_id_fk` FOREIGN KEY (`author_id`) REFERENCES `users`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `enrollments` ADD CONSTRAINT `enrollments_student_id_student_profiles_user_id_fk` FOREIGN KEY (`student_id`) REFERENCES `student_profiles`(`user_id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `enrollments` ADD CONSTRAINT `enrollments_classroom_id_classrooms_id_fk` FOREIGN KEY (`classroom_id`) REFERENCES `classrooms`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `evaluations` ADD CONSTRAINT `evaluations_assignment_id_teacher_assignments_id_fk` FOREIGN KEY (`assignment_id`) REFERENCES `teacher_assignments`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `evaluations` ADD CONSTRAINT `evaluations_competency_id_competencies_id_fk` FOREIGN KEY (`competency_id`) REFERENCES `competencies`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `evaluations` ADD CONSTRAINT `evaluations_created_by_id_users_id_fk` FOREIGN KEY (`created_by_id`) REFERENCES `users`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `guardian_profiles` ADD CONSTRAINT `guardian_profiles_user_id_users_id_fk` FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `guardian_students` ADD CONSTRAINT `guardian_students_guardian_id_guardian_profiles_user_id_fk` FOREIGN KEY (`guardian_id`) REFERENCES `guardian_profiles`(`user_id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `guardian_students` ADD CONSTRAINT `guardian_students_student_id_student_profiles_user_id_fk` FOREIGN KEY (`student_id`) REFERENCES `student_profiles`(`user_id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `messages` ADD CONSTRAINT `messages_institution_id_institutions_id_fk` FOREIGN KEY (`institution_id`) REFERENCES `institutions`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `messages` ADD CONSTRAINT `messages_sender_id_users_id_fk` FOREIGN KEY (`sender_id`) REFERENCES `users`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `messages` ADD CONSTRAINT `messages_recipient_id_users_id_fk` FOREIGN KEY (`recipient_id`) REFERENCES `users`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `messages` ADD CONSTRAINT `messages_student_id_student_profiles_user_id_fk` FOREIGN KEY (`student_id`) REFERENCES `student_profiles`(`user_id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `notifications` ADD CONSTRAINT `notifications_user_id_users_id_fk` FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `schedule_slots` ADD CONSTRAINT `schedule_slots_assignment_id_teacher_assignments_id_fk` FOREIGN KEY (`assignment_id`) REFERENCES `teacher_assignments`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `sessions` ADD CONSTRAINT `sessions_user_id_users_id_fk` FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `student_profiles` ADD CONSTRAINT `student_profiles_user_id_users_id_fk` FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `subjects` ADD CONSTRAINT `subjects_institution_id_institutions_id_fk` FOREIGN KEY (`institution_id`) REFERENCES `institutions`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `teacher_assignments` ADD CONSTRAINT `teacher_assignments_teacher_id_teacher_profiles_user_id_fk` FOREIGN KEY (`teacher_id`) REFERENCES `teacher_profiles`(`user_id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `teacher_assignments` ADD CONSTRAINT `teacher_assignments_classroom_id_classrooms_id_fk` FOREIGN KEY (`classroom_id`) REFERENCES `classrooms`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `teacher_assignments` ADD CONSTRAINT `teacher_assignments_subject_id_subjects_id_fk` FOREIGN KEY (`subject_id`) REFERENCES `subjects`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `teacher_profiles` ADD CONSTRAINT `teacher_profiles_user_id_users_id_fk` FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `users` ADD CONSTRAINT `users_institution_id_institutions_id_fk` FOREIGN KEY (`institution_id`) REFERENCES `institutions`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
CREATE INDEX `alerts_student_idx` ON `alerts` (`student_id`);--> statement-breakpoint
CREATE INDEX `attendance_classroom_date_idx` ON `attendance_records` (`classroom_id`,`attendance_date`);--> statement-breakpoint
CREATE INDEX `attendance_student_idx` ON `attendance_records` (`student_id`);--> statement-breakpoint
CREATE INDEX `classrooms_institution_idx` ON `classrooms` (`institution_id`);--> statement-breakpoint
CREATE INDEX `competencies_subject_idx` ON `competencies` (`subject_id`);--> statement-breakpoint
CREATE INDEX `competency_results_student_idx` ON `competency_results` (`student_id`);--> statement-breakpoint
CREATE INDEX `conclusions_student_idx` ON `descriptive_conclusions` (`student_id`);--> statement-breakpoint
CREATE INDEX `enrollments_classroom_idx` ON `enrollments` (`classroom_id`);--> statement-breakpoint
CREATE INDEX `evaluations_assignment_idx` ON `evaluations` (`assignment_id`);--> statement-breakpoint
CREATE INDEX `guardian_students_student_idx` ON `guardian_students` (`student_id`);--> statement-breakpoint
CREATE INDEX `messages_recipient_idx` ON `messages` (`recipient_id`,`created_at`);--> statement-breakpoint
CREATE INDEX `messages_student_idx` ON `messages` (`student_id`);--> statement-breakpoint
CREATE INDEX `notifications_user_idx` ON `notifications` (`user_id`,`created_at`);--> statement-breakpoint
CREATE INDEX `schedule_slots_assignment_idx` ON `schedule_slots` (`assignment_id`);--> statement-breakpoint
CREATE INDEX `schedule_slots_day_idx` ON `schedule_slots` (`day_of_week`);--> statement-breakpoint
CREATE INDEX `sessions_user_idx` ON `sessions` (`user_id`);--> statement-breakpoint
CREATE INDEX `subjects_institution_idx` ON `subjects` (`institution_id`);--> statement-breakpoint
CREATE INDEX `teacher_assignments_teacher_idx` ON `teacher_assignments` (`teacher_id`);--> statement-breakpoint
CREATE INDEX `users_institution_idx` ON `users` (`institution_id`);--> statement-breakpoint
CREATE INDEX `users_role_idx` ON `users` (`role`);