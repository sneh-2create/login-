# Legacy Page to Micro-Frontend Mapping

This document maps the pages from the legacy Angular application (based on `menu.config.ts` and module analysis) to the new React Micro-Frontend applications.

## Application Scopes

| Application | Scope Description |
|---|---|
| **admission-crm** | Manages student admission lifecycle, leads, and inquiries. |
| **fee-module** | Handles fee collection, receipt generation, refunds, and financial reporting related to fees. |
| **academic-module** | Core academic functions: Student management, Attendance, Timetable, Lesson Planning, School Diary, Learning Management, and Library. |
| **exam-coe** | Examination management, marks entry, report cards, and Controller of Examinations (COE) functions. |
| **hrm** | Human Resource Management: Employee records, Leave, Payroll, and Employee Self-Service Portal. |
| **back-office** | Administrative and Support functions: Accounting, Transport, Hostel, Mess, Communication, Inventory, User Management, Analytics, and System Configuration. |

## Page Mapping Details

### 1. Admission CRM
| Legacy Module | Page Title | Route | Permission |
|---|---|---|---|
| **Admission** | Student Registration > Application Data | `/admission/studentData` | `viewAdmissionStudentDataList` |
| **Admission** | Admission Leads | `/admission/admissionLeads` | `viewAdmissionStudentDataList` |
| **Admission** | Follow Ups | `/admission/followUps` | `viewAdmissionStudentData` |
| **Admission** | Transactions | `/admission/transaction` | `viewAdmissionTransactionList` |
| **Admission** | Admission Lead Logs | `/admission/admissionLeadLogs` | `viewAdmissionLeadLogsList` |
| **Admission** | Admission Reports > Daily Collection | `/admission/dailyCollectionReport` | `viewDailyAdmissionCollectionReport` |
| **Admission** | Admission Reports > Summary Report | `/admission/admissionSummaryReports` | `viewAdmissionSummaryReport` |
| **Admission** | Admission Reports > Subject Combination | `/admission/vacentSeats` | `viewSubjectCombinationReport` |
| **Admission** | Admission Reports > NEP Subject | `/admission/nepSubjectReport` | `viewNEPSubjectReport` |
| **Admission** | Admission Reports > Counselor Productivity | `/admission/counselorProductivityReport` | `viewCounselorProductivityReport` |
| **Admission** | Admission Reports > Source Wise | `/admission/sourceWiseReport` | `viewAdmissionSourceWiseReport` |
| **Admission** | Admission Reports > Counselor Tag | `/admission/counselorTagReport` | `viewAdmissionCounselorTagReport` |
| **Admission** | Admission Reports > Course Wise Tag | `/admission/courseWiseTagReport` | `viewAdmissionCourseTagReport` |

### 2. Fee Module
| Legacy Module | Page Title | Route | Permission |
|---|---|---|---|
| **Fee** | Collect Fee > Collect Fee | `/fee/collectFee` | `collectFee` |
| **Fee** | Collect Fee > Collect Fee Other | `/fee/collectFee/:type` | `collectFee` |
| **Fee** | Collect Fee > All Session | `/fee/collectFeeAllSession` | `collectFeeAllSession` |
| **Fee** | Collect Fee > Miscellaneous | `/fee/collectFee/miscellenous` | `collectFee` |
| **Fee** | Other Income > Collect | `/fee/collectOtherIncome` | `collectOtherIncome` |
| **Fee** | Other Income > Transaction List | `/fee/otherIncomeTransactionList` | `viewOtherIncomeTransactionList` |
| **Fee** | Transaction > List | `/fee/transactionList` | `viewTransactionList` |
| **Fee** | Transaction > Adjustment | `/fee/feeAdjusment` | `createAdjustmentTransaction` |
| **Fee** | Transaction > Online List | `/fee/onlineTransactionList` | `viewOnlineTransactionList` |
| **Fee** | Concession > Report | `/fee/concessionReport` | `viewConcessionReport` |
| **Fee** | Concession > Utilization | `/fee/concessionUtilizationReport` | `viewConcessionUtilizationReport` |
| **Fee** | Refund > Make Refund | `/fee/refund` | `getRefundDetails` |
| **Fee** | Refund > Transaction List | `/fee/refundTransactionList` | `viewRefundTransactionList` |
| **Fee** | Refund > Report | `/fee/refundReport` | `viewRefundTransactionList` |
| **Fee** | Refund > Bulk Refund | `/fee/bulkFeeRefund` | `getBulkFeeRefundDetails` |
| **Fee** | Reports > Combined Daily Collection | `/fee/combinedDailyCollectionReport` | `viewCombinedDailyCollectionReport` |
| **Fee** | Reports > Daily Fee Report | `/fee/dailyFeeReport` | `viewDailyFeeReport` |
| **Fee** | Reports > Fee Head Collection | `/fee/dailyFeeHeadCollectionReport` | `viewDailyFeeHeadCollectionReport` |
| **Fee** | Reports > Payment Mode Collection | `/fee/dailyPaymentModeCollectionReport` | `viewDailyPaymentModeCollectionReport` |
| **Fee** | Reports > Due Fee Report | `/fee/dueFeeReport` | `viewDueFeeReport` |
| **Fee** | Reports > Due Fee Course Wise | `/fee/dueFeeReportCourseWise` | `viewDueFeeReportCourseWise` |
| **Fee** | Reports > Multi Session Due Fee | `/fee/multiSessionDueFeeReport` | `viewMultiSessionDueFeeReport` |
| **Fee** | Reports > Transport Due Fee | `/fee/transportDueFeeReport` | `viewTransportReport` |
| **Fee** | Reports > Student Wise Register | `/fee/feeRegisterStudentWise` | `viewStudentWiseFeeRegister` |
| **Fee** | Fee Summary > Course Wise | `/fee/courseWiseReport` | `viewCourseWiseCollectionReport` |
| **Fee** | Fee Summary > Category Wise | `/fee/categoryWiseReport` | `viewCategoryWiseCollectionReport` |
| **Fee** | Fee Summary > Head Wise | `/fee/feeHeadWiseReport` | `viewFeeHeadWiseCollectionReport` |
| **Fee** | Fee Summary > Group Wise | `/fee/feeGroupWiseReport` | `viewFeeHeadGroupWiseCollectionReport` |
| **Fee** | Fee Summary > Combined Head Wise | `/fee/combinedHeadWiseFeeSummary` | `viewCombinedHeadWiseCollectionReport` |
| **Fee** | Student Payment Summary | `/fee/studentPaymentSummary` | `viewStudentPaymentSummary` |
| **Fee** | Daily Transport Collection | `/fee/dailyTransportCollection` | `dailyTransportCollection` |

### 3. Academic Module
| Legacy Module | Page Title | Route | Permission |
|---|---|---|---|
| **Student** | Student List | `/student/studentList` | `viewStudentList` |
| **Student** | Student List Course Wise | `/student/studentListCourseWise` | `studentListCourseWise` |
| **Student** | Student Certificates | `/student/studentCertificates` | `downloadStudentCertificates` |
| **Student** | Student Feedback | `/student/studentFeedback` | `viewStudentTimelineList` |
| **Student** | Utilities > Update RegNo | `/student/studentUtilities` | `viewStudentUtilities` |
| **Student** | Utilities > Update Height/Weight | `/academicsSetup/updateStudentDetails` | `updateMultipleStudentDetails` |
| **Student** | Utilities > Assign Roll No | `/academicsSetup/assignRollNo` | `assignStudentRollNo` |
| **Student** | Utilities > Allocate Subjects | `/academicsSetup/allocateSubjects` | `allocateSubjectsToStudents` |
| **Student** | Utilities > Session Manage | `/student/studentSessionManage` | `addStudentsToSession` |
| **Student** | Reports > Allocated Subject | `/student/allocatedSubjectReport` | `viewAllocatedSubjectsReport` |
| **Student** | Reports > Subject Wise Count | `/student/subjectWiseCountReport` | `viewSubjectCountReport` |
| **Student** | Reports > Subject Comb Count | `/student/subjectCombinationWiseCountReport` | `viewSubjectCombinationCountReport` |
| **Student** | Reports > Export Data | `/student/exportReport` | `viewStudentList` |
| **Student** | Reports > University Data | `/student/universityReport` | `viewUniversityData` |
| **Student** | Reports > Strength Report | `/student/strengthReport` | `viewStudentStrengthReport` |
| **Student** | Reports > Gender Wise Strength | `/student/genderWiseCategoryStrengthReport` | `viewStudentGenderCategoryStrengthReport` |
| **Student** | Reports > Sibling Report | `/student/siblingReports` | `viewSiblingReport` |
| **Student** | Reports > Feedback Report | `/student/studentFeedbackReport` | `isStudentTimelineAdmin` |
| **Student** | Reports > Admission Withdrawal | `/student/admisssionWithdrawalRegister` | `viewStudentAdmissionWithdrawalReport` |
| **Student** | Reports > Cert Issuance | `/student/certificateIssuranceReport` | `studentCertificateReport` |
| **Attendance** | Student Attendance | `/attendance/studentAttendance` | `viewStudentAttendanceList` |
| **Attendance** | Student Attendance V2 | `/attendance/studentAttendanceV2` | `viewMultiCourseStudentAttendanceList` |
| **Attendance** | Teacher Wise Attendance | `/attendance/markAttendanceTeacherWise` | `viewTeacherWiseStudentAttendanceList` |
| **Attendance** | Mark All Attendance | `/attendance/markAllStudentAttendance` | `markAllStudentAttendance` |
| **Attendance** | Reports > Daily Report | `/attendance/attendanceReport` | `viewAttendanceReport` |
| **Attendance** | Reports > Summary | `/attendance/attendanceSummary` | `viewAttendanceSummary` |
| **Attendance** | Reports > Not Marked | `/attendance/notMarkedReport` | `viewAttendanceNotMarkedReport` |
| **Attendance** | Applied Leave | `/attendance/appliedLeave` | `viewAppliedLeaveList` |
| **Attendance New** | (Mirrors Attendance) | `/attendanceNew/*` | `attendanceModule` |
| **Attendance V3** | Student Attendance | `/attendanceV3` | `getListStudentAttendanceV3` |
| **Timetable** | Daily Schedule Employees | `/attendance/dailyScheduleEmployees` | `viewDailyTimeTableSchedule` |
| **Timetable** | Employee Schedule | `/attendance/singleEmployeeSchedule` | `viewEmployeeTimeTableSchedule` |
| **Timetable** | Course Wise Schedule | `/attendance/timeTableCourseWise` | `viewCourseTimeTableSchedule` |
| **Timetable** | Status | `/attendance/timeTableStatus` | `timeTableStatusReport` |
| **School Diary** | Assignment | `/schoolDiary/assignment` | `viewAssignmentList` |
| **School Diary** | Homework | `/schoolDiary/homework` | `viewHomeworkList` |
| **School Diary** | Homework New | `/schoolDiary/homeworkNew` | `viewHomeworkList` |
| **School Diary** | Circular | `/schoolDiary/circular` | `viewCircularList` |
| **School Diary** | Notice | `/schoolDiary/notice` | `viewNoticeList` |
| **School Diary** | Syllabus | `/schoolDiary/syllabus` | `viewSyllabusList` |
| **School Diary** | Date Sheet | `/schoolDiary/dateSheet` | `viewDateSheetList` |
| **School Diary** | E-Learning | `/schoolDiary/eLearning` | `viewELearningList` |
| **School Diary** | Time Table | `/schoolDiary/timeTable` | `viewDateSheetList` |
| **LMS** | Learning Management | `/learningManagement` | `viewLearningManagementList` |
| **Lesson Plan** | Management | `/lessonManagement` | `viewLessonPlanList` |
| **Lesson Plan** | Report | `/lessonManagement/subjectWiseReport` | `viewSubjectWiseLessonReport` |
| **Library** | Books | `/library/libraryBook` | `viewLibraryBookList` |
| **Library** | Issue Book | `/library/issueBook` | `issueLibraryBook` |
| **Library** | Issued Books | `/library/issueRecords/libraryDetails` | `getAllLibraryIssueRecords` |
| **Library** | Stock Verify | `/library/stockVerify` | `libraryStockVerify` |
| **Library** | Visitor | `/library/libraryVisitor` | `viewLibraryVisitList` |
| **Library** | Digital Library | `/library/digitalLibrary` | `viewDigitalLibraryList` |
| **Library** | Serial Subscription | `/library/serialSubscription` | `viewLibrarySerialSubscriptionList` |
| **Library** | Reports | `/library/libraryReports` | `viewLibraryBookList` |
| **WebOPAC** | WebOPAC | `/web-opac` | `viewWebOPAC` |

### 4. Exam/COE Module
| Legacy Module | Page Title | Route | Permission |
|---|---|---|---|
| **Examination** | Marks > Assessment Wise | `/examination/assessmentsMarks` | `viewAssessmentMarks` |
| **Examination** | Marks > Student Wise | `/examination/assessmentsMarksStudentWise` | `viewAssessmentMarksByStudent` |
| **Examination** | Marks > Subject Wise | `/examination/marksEntryMultipleAssessment` | `viewAssessmentMarks` |
| **Examination** | Marks > Skill Wise | `/examination/studentMarksEntrySkillWise` | `viewAssessmentMarksBySkill` |
| **Examination** | Class Test | `/examination/classTestEntry` | `viewClassTest` |
| **Examination** | Reports > Assessment Wise | `/examination/assessmentsWiseReport` | `viewMarksByCourse` |
| **Examination** | Reports > Green Sheet | `/examination/greenSheet` | `viewGreenSheet` |
| **Examination** | Reports > Report Card | `/examination/reportCardData` | `viewReportCard` |
| **Examination** | Reports > Report Card V2 | `/examination/reportCardDatav2` | `viewReportCardv2` |
| **Examination** | Reports > DMC | `/examination/assessmentsMarksStudentWiseV3` | `viewAssessmentMarksByStudentv2` |
| **Examination** | Reports > Result At A Glance | `/examination/resultAtAGlance` | `viewCourseResultReport` |
| **Examination** | Exam Registration | `/examination/examRegistration` | `viewExamRegistrationList` |
| **Examination** | Issue Admit Card | `/examination/issueAdmitCard` | `viewExamRegistrationList` |
| **Examination** | Exam Analysis Report | `/examination/examAnalysisReport` | `viewExamRegistrationList` |
| **Examination Insights** | Student Wise | `/insights/examinationInsights` | `examinationInsights` |
| **Examination Insights** | Course Wise | `/examination/cbseResult` | `getClassAssessmentStats` |
| **COE Exam** | Subject Wise Report | `/examination/subjectWiseReport` | `viewExamSubjectReport` |
| **COE Exam** | Date Sheet Report | `/examination/dateSheetReport` | `viewExamDateSheet` |
| **COE Exam** | Seat Schedule Report | `/examination/seatScheduleReport` | `viewExamSeatScheduleReport` |

### 5. HRM Module
| Legacy Module | Page Title | Route | Permission |
|---|---|---|---|
| **HRM** | Employee | `/hrm/employee` | `viewEmployeeList` |
| **HRM** | Manage Employee | `/hrm/manageEmployee` | `manageEmployee` |
| **HRM** | Entitled Leaves | `/hrm/employeeEntitledLeaves` | `viewEmployeeEntitledLeave` |
| **HRM** | Attendance Calendar | `/hrm/employeeAttendanceCalendar` | `getEmployeeAttendanceCalendar` |
| **HRM** | Reports > Employee Report | `/hrm/employeeReport` | `viewEmployeeList` |
| **HRM** | Reports > Leave Type | `/hrm/employeeEntitledLeaveTypeReport` | `viewEmployeeEntitledLeaveTypeReport` |
| **HRM** | Reports > Attendance Time | `/hrm/employeeAttendanceReport` | `viewDailyEmployeeAttendanceReport` |
| **HRM** | Reports > Attendance | `/hrm/attendanceReport` | `viewDailyEmployeeAttendanceReport` |
| **HRM** | Reports > Absentees/Late | `/hrm/lateArrivalAbsenteeReport` | `viewDailyEmployeeAttendanceReport` |
| **HRM** | Reports > Leave Approval | `/hrm/appliedLeaves` | `viewEmployeeLeaveApprovalReport` |
| **HRM** | Employee Promotion | `/hrm/employeePromotion` | `viewEmployeePromotionList` |
| **HRM** | Mark Attendance | `/hrm/markEmployeeAttendance` | `addEmployeeAttendance` |
| **HRM** | Biometric Attendance | `/hrm/employeeAttendance` | `editEmployeeAttendance` |
| **HRM** | Attendance Regularization | `/hrm/employeeAttendanceRegularization` | `viewEmployeeAttendanceRegularizationList` |
| **HRM** | Process Salary > Compute | `/hrm/processSalary` | `processEmployeeSalary` |
| **HRM** | Process Salary > Summary | `/hrm/salarySummary` | `viewEmployeeSalaryMonthWise` |
| **HRM** | Salary Reports > Slip | `/hrm/employeeSalarySummary` | `viewEmployeeSalaryList` |
| **HRM** | Salary Reports > Register | `/hrm/employeeSalaryRegister` | `viewEmployeeSalaryMonthlyReport` |
| **HRM** | Salary Reports > PF Challan | `/hrm/pfChallanReport` | `viewPFChallanReport` |
| **Employee Portal** (Self) | Profile | `/profilePortal/profile` | `profileDashboard` |
| **Employee Portal** (Self) | Leaves | `/profilePortal/applyLeaves` | `viewEmployeeLeaveList` |
| **Employee Portal** (Self) | Salary Slip | `/hrm/employeeSalarySummary` | `viewEmployeeSalaryList` |
| **Employee Portal** (Self) | Calendar | `/profilePortal/calendar` | `calendarDashboard` |
| **Employee Portal** (Self) | Tasks | `/profilePortal/myTask` | `viewUserTaskList` |

### 6. Back Office Module
| Legacy Module | Page Title | Route | Permission |
|---|---|---|---|
| **Accounting** | Accounting | `/accounting/accounting` | `accountingModule` |
| **Accounting** | Manage Cash | `/accounting/manageCash` | `getManageCashList` |
| **Accounting** | Voucher | `/accounting/voucher` | `viewAccountingVoucherList` |
| **Accounting** | Income/Expenditure | `/accounting/incomeExpenditureReport` | `getIncomeAndExpenditureAccount` |
| **Expense** | Expense Management | `/expenseManagement/expenseManagementSystem` | `viewExpenseManagementList` |
| **Transport** | Assign Transport | `/transportAttendance/assignTransport` | `assignRouteToStudent` |
| **Transport** | Transport Report | `/student/transportReport` | `viewTransportReport` |
| **Transport** | Occupancy | `/student/transportOccupancy` | `viewTransportOccupancyReport` |
| **Transport** | Attendance | `/transportAttendance` | `viewTransportAttendance` |
| **Transport** | Attendance QR | `/transportAttendance/transportAttendanceQr` | `viewTransportAttendanceByQR` |
| **Transport** | Daily Summary | `/transportAttendance/dailySummaryRouteWise` | `viewDailyTransportAttendanceReport` |
| **Hostel** | Hostel Report | `/hostelAttendance/hostelReport` | `viewHostelReport` |
| **Hostel** | Occupancy Report | `/hostelAttendance/occupancyReport` | `viewHostelOccupancyReport` |
| **Hostel** | Hostel Attendance | `/hostelAttendance` | `getHostelAttendanceStudents` |
| **Hostel** | Gate Pass | `/hostelAttendance/hostelGatePass` | `viewHostelGatePassList` |
| **Mess** | Dashboard | `/messManagement/messManagementDashboard` | `getMessMangementDashboard` |
| **Mess** | Attendance | `/messManagement/messAttendance` | `viewMessAttendanceList` |
| **Mess** | Reports | `/messManagement/messManagementDetailedReport` | `messAttendanceDetailedReport` |
| **FrontDesk** | Visitor | `/frontDesk/visitor` | `viewVisitorList` |
| **FrontDesk** | Gate Pass | `/frontDesk/gatePass` | `viewGatePassList` |
| **Communication** | Send SMS | `/communication/sendSMS` | `sendSMSCommunication` |
| **Communication** | Send Email | `/communication/sendEmail` | `sendEmailCommunication` |
| **Communication** | Send Whatsapp | `/communication/webWhatsappMessage` | `sendWhatsAppWebCommunication` |
| **Communication** | Report | `/communication/report` | `viewCommunicationReport` |
| **Advanced** | Alumni | `/advancedSetup/alumni` | `viewAlumniList` |
| **Advanced** | Seminar | `/advancedSetup/seminar` | `viewSeminarList` |
| **Advanced** | Event | `/advancedSetup/event` | `viewEventList` |
| **Advanced** | Research Publication | `/advancedSetup/researchPublication` | `viewResearchPublicationList` |
| **Advanced** | Resource Person | `/advancedSetup/resourcePerson` | `viewResourcePersonList` |
| **Analytics** | Dashboard | `/analytics/dashboard` | `viewAnalyticsDashboard` |
| **Analytics** | Partner Institutes | `/analytics/partnerInstitute` | `viewPartnerInstituteList` |
| **Analytics** | Partner Companies | `/analytics/partnerCompany` | `viewPartnerCompanyList` |
| **Analytics** | Placement Summary | `/analytics/placementSummary` | `getPlacementDriveSummary` |
| **Bulk Ops** | Report File | `/reportFile` | `viewReportFileList` |
| **Bulk Ops** | Excel Upload Logs | `/reportFile/excelUploadLogs` | `viewExcelUploadLogsList` |
| **Users** | Users | `/users` | `viewUserList` |
| **Users** | Task Management | `/taskManagement` | `viewUserTaskList` |
| **Feedback** | Feedback Student | `/schoolSetup/feedbackStudent` | `viewFeedbackFromStudentList` |
| **Feedback** | Feedback Dashboard | `/feedbackFromStudent/feedbackDashboard` | `courseWiseFeedbackFromStudentCount` |
| **SharePoint** | Share Point | `/sharePoint` | `sharePointModule` |
| **Social** | Social Media | `/socialMedia` | `socialMediaModule` |
| **NAAC** | Criterion 1-3 | `/naac/metric*` | `naacModule` |
| **Gallery** | Gallery | `/gallery` | `viewGalleryList` |
| **Queries** | Student Queries | `/studentQueries` | `viewStudentQueryList` |
| **CMS** | CMS | `/cms` | `viewEntityWebsiteConfig` |

### 7. Dashboards
| Legacy Module | Dashboard Title | Route | Permission | Target App |
|---|---|---|---|---|
| **Core** | Entity Dashboard (Admin) | `/entity/dashboard` | `viewEntityDashboard` | **shell** |
| **Student** | Student Dashboard | `/studentDashboard` | `dashboardStudent` | **academic-module** |
| **Analytics** | Analytics Dashboard | `/analytics/dashboard` | `viewAnalyticsDashboard` | **back-office** |
| **Mess** | Mess Dashboard | `/messManagement/messManagementDashboard` | `getMessMangementDashboard` | **back-office** |
| **Feedback** | Feedback Dashboard | `/feedbackFromStudent/feedbackDashboard` | `courseWiseFeedbackFromStudentCount` | **back-office** |
| **HRM** | Employee Profile Dashboard | `/profilePortal/profile` | `profileDashboard` | **hrm** |
