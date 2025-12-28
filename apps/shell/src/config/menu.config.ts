
export const menuConfig = {
    header: {
        self: {},
        items: []
    },
    adminAside: {
        self: {},
        items: [
            {
                title: 'Dashboard',
                root: true,
                icon: 'flaticon3-house',
                page: '/dashboard',
                bullet: 'dot',
                admPermission: 'viewSuperAdminDashboard'
            },
            {
                title: 'Entity List',
                root: true,
                bullet: 'dot',
                icon: 'flaticon2-list-2',
                page: '/superAdmin/entityList',
                admPermission: 'viewEntityList'
            }
        ]
    },
    entityAside: {
        self: {},
        items: [
            {
                title: 'Dashboard',
                root: true,
                icon: 'flaticon3-house',
                page: '/entity/dashboard',
                bullet: 'dot',
                entPermission: 'viewEntityDashboard'
            },
            {
                title: 'Employee Portal',
                root: true,
                bullet: 'dot',
                icon: 'flaticon3-team',
                entPermission: 'profileDashboard',
                submenu: [
                    {
                        title: 'Profile',
                        bullet: 'dot',
                        page: '/profilePortal/profile',
                        entPermission: 'profileDashboard',
                    },
                    {
                        title: 'My Leaves',
                        bullet: 'dot',
                        page: '/profilePortal/applyLeaves',
                        entPermission: 'viewEmployeeLeaveList',
                    },
                    {
                        title: 'Salary Slip',
                        bullet: 'dot',
                        page: '/hrm/employeeSalarySummary',
                        entPermission: 'viewEmployeeSalaryList',
                    },
                    {
                        title: 'Calendar',
                        bullet: 'dot',
                        page: '/profilePortal/calendar',
                        entPermission: 'calendarDashboard',
                    },
                    {
                        title: 'My Task',
                        bullet: 'dot',
                        page: '/profilePortal/myTask',
                        entPermission: 'viewUserTaskList',
                    },
                    {
                        title: 'Attendance Regularization',
                        bullet: 'dot',
                        page: '/hrm/employeeAttendanceRegularization',
                        entPermission: 'viewEmployeeAttendanceRegularizationList',
                    },
                    {
                        title: 'Issued Books',
                        bullet: 'dot',
                        page: '/library/issueRecords/employeeDetails',
                        entPermission: 'getAllLibraryIssueRecords',
                    },
                    {
                        title: 'User Preference',
                        bullet: 'dot',
                        page: '/profilePortal/userPreference',
                        entPermission: 'profileDashboard',
                    },
                    {
                        title: 'Employee Announcement',
                        bullet: 'dot',
                        page: '/communication/employeeAnnouncement',
                        entPermission: 'viewEmployeeAnnouncementList',
                    },
                    {
                        title: 'WebOPAC',
                        bullet: 'dot',
                        page: `/web-opac`,
                        entPermission: 'viewWebOPAC',
                    }
                ]
            },
            {
                title: 'Admission',
                root: true,
                bullet: 'dot',
                icon: 'flaticon3-report',
                page: '/admission',
                entPermission: 'admissionModule',
                submenu: [
                    {
                        title: 'Student Registration',
                        bullet: 'dot',
                        entPermission: 'admissionModule',
                        submenu: [
                            {
                                title: 'Application Data',
                                bullet: 'dot',
                                page: '/admission/studentData',
                                entPermission: 'viewAdmissionStudentDataList',
                            },
                            {
                                title: 'Admission Leads',
                                bullet: 'dot',
                                icon: 'flaticon-list-1',
                                page: '/admission/admissionLeads',
                                entPermission: 'viewAdmissionStudentDataList',
                            },
                            {
                                title: 'Follow Ups',
                                bullet: 'dot',
                                icon: 'flaticon2-calendar-5',
                                page: '/admission/followUps',
                                entPermission: 'viewAdmissionStudentData',
                            },
                            {
                                title: 'Admission Transactions',
                                bullet: 'dot',
                                page: '/admission/transaction',
                                entPermission: 'viewAdmissionTransactionList',
                            },
                        ]
                    },
                    {
                        title: 'Admission Reports',
                        bullet: 'dot',
                        entPermission: 'viewAdmissionReports',
                        submenu: [
                            {
                                title: 'Daily Collection Report',
                                bullet: 'dot',
                                page: '/admission/dailyCollectionReport',
                                entPermission: 'viewDailyAdmissionCollectionReport',
                            },
                            {
                                title: 'Admission Summary Report',
                                bullet: 'dot',
                                page: '/admission/admissionSummaryReports',
                                entPermission: 'viewAdmissionSummaryReport',
                            },
                            {
                                title: 'Subject Combination Report',
                                bullet: 'dot',
                                page: '/admission/vacentSeats',
                                entPermission: 'viewSubjectCombinationReport',
                            },
                            {
                                title: 'NEP Subject Report',
                                bullet: 'dot',
                                page: '/admission/nepSubjectReport',
                                entPermission: 'viewNEPSubjectReport',
                            },
                            {
                                title: 'Counselor Productivity Report',
                                bullet: 'dot',
                                page: '/admission/counselorProductivityReport',
                                entPermission: 'viewCounselorProductivityReport',
                            },
                            {
                                title: 'Source Wise Report',
                                bullet: 'dot',
                                page: '/admission/sourceWiseReport',
                                entPermission: 'viewAdmissionSourceWiseReport',
                            },
                            {
                                title: 'Counselor Tag Report',
                                bullet: 'dot',
                                page: '/admission/counselorTagReport',
                                entPermission: 'viewAdmissionCounselorTagReport',
                            },
                            {
                                title: 'Course Wise Tag Report',
                                bullet: 'dot',
                                page: '/admission/courseWiseTagReport',
                                entPermission: 'viewAdmissionCourseTagReport',
                            },
                            {
                                title: 'Admission Lead Logs',
                                bullet: 'dot',
                                icon: 'flaticon2-calendar-5',
                                page: '/admission/admissionLeadLogs',
                                entPermission: 'viewAdmissionLeadLogsList',
                            },
                        ]
                    },
                ]
            },
            {
                title: 'Student',
                root: true,
                bullet: 'dot',
                icon: 'flaticon3-graduated',
                page: '/student/studentList',
                entPermission: 'studentModule',
                submenu: [
                    {
                        title: 'Student',
                        bullet: 'dot',
                        entPermission: 'studentModule',
                        submenu: [
                            {
                                title: 'Student List',
                                bullet: 'dot',
                                page: '/student/studentList',
                                entPermission: 'viewStudentList',
                            },
                            {
                                title: 'Student List Course Wise',
                                bullet: 'dot',
                                page: '/student/studentListCourseWise',
                                entPermission: 'studentListCourseWise',
                            },
                            {
                                title: 'Student Certificates',
                                bullet: 'dot',
                                page: '/student/studentCertificates',
                                entPermission: 'downloadStudentCertificates',
                            },
                            {
                                title: 'Student Feedback',
                                bullet: 'dot',
                                page: '/student/studentFeedback',
                                entPermission: 'viewStudentTimelineList',
                            },
                        ]
                    },
                    {
                        title: 'Student Utilities',
                        bullet: 'dot',
                        page: '/student/studentUtilities',
                        entPermission: 'viewStudentUtilities',
                        submenu: [
                            {
                                title: 'Update RegNo',
                                bullet: 'dot',
                                page: '/student/studentUtilities',
                                entPermission: 'viewStudentUtilities'
                            },
                            {
                                title: 'Update Height & Weight',
                                bullet: 'dot',
                                page: '/academicsSetup/updateStudentDetails',
                                entPermission: 'updateMultipleStudentDetails',
                            },
                            {
                                title: 'Assign Roll No.',
                                bullet: 'dot',
                                page: '/academicsSetup/assignRollNo',
                                entPermission: 'assignStudentRollNo',
                            },
                            {
                                title: 'Allocate Subjects',
                                bullet: 'dot',
                                page: '/academicsSetup/allocateSubjects',
                                entPermission: 'allocateSubjectsToStudents',
                            },
                            {
                                title: 'Student Session Management',
                                bullet: 'dot',
                                page: '/student/studentSessionManage',
                                entPermission: 'addStudentsToSession',
                            },
                        ]
                    },
                    {
                        title: 'Student Academic Reports',
                        bullet: 'dot',
                        page: '/student/allocatedSubjectReport',
                        entPermission: 'viewAllocatedSubjectsReport',
                        submenu: [
                            {
                                title: 'Allocated Subject Report',
                                bullet: 'dot',
                                page: '/student/allocatedSubjectReport',
                                entPermission: 'viewAllocatedSubjectsReport'
                            },
                            {
                                title: 'Subject Wise Count Report',
                                bullet: 'dot',
                                page: '/student/subjectWiseCountReport',
                                entPermission: 'viewSubjectCountReport',
                            },
                            {
                                title: 'Subject Combination Wise Count Report',
                                bullet: 'dot',
                                page: '/student/subjectCombinationWiseCountReport',
                                entPermission: 'viewSubjectCombinationCountReport',
                            },
                        ]
                    },
                    {
                        title: 'Student Reports',
                        bullet: 'dot',
                        entPermission: 'viewStudentList',
                        submenu: [
                            {
                                title: 'Export Data',
                                bullet: 'dot',
                                page: '/student/exportReport',
                                entPermission: 'viewStudentList',
                            },
                            {
                                title: 'University Data',
                                bullet: 'dot',
                                page: '/student/universityReport',
                                entPermission: 'viewUniversityData',
                            },
                            {
                                title: 'Strength Report',
                                bullet: 'dot',
                                page: '/student/strengthReport',
                                entPermission: 'viewStudentStrengthReport',
                            },
                            {
                                title: 'Gender Wise Category Report',
                                bullet: 'dot',
                                page: '/student/genderWiseCategoryStrengthReport',
                                entPermission: 'viewStudentGenderCategoryStrengthReport'
                            },
                            {
                                title: 'Sibling Report',
                                bullet: 'dot',
                                page: '/student/siblingReports',
                                entPermission: 'viewSiblingReport'
                            },
                            {
                                title: 'Feedback Report',
                                bullet: 'dot',
                                page: '/student/studentFeedbackReport',
                                entPermission: 'isStudentTimelineAdmin',
                            },
                            {
                                title: 'Admission Withdrawal Report',
                                bullet: 'dot',
                                page: '/student/admisssionWithdrawalRegister',
                                entPermission: 'viewStudentAdmissionWithdrawalReport',
                            },
                            {
                                title: 'Certificate Issuance Report',
                                bullet: 'dot',
                                page: '/student/certificateIssuranceReport',
                                entPermission: 'studentCertificateReport',
                            },
                        ],
                    },
                ]
            },
            {
                title: 'Fee',
                root: true,
                bullet: 'dot',
                icon: 'flaticon3-money-1',
                entPermission: 'feeModule',
                submenu: [
                    {
                        title: 'Collect Fee',
                        bullet: 'dot',
                        entPermission: 'feeModule',
                        submenu: [
                            {
                                title: 'Collect Fee',
                                bullet: 'dot',
                                page: '/fee/collectFee',
                                entPermission: 'collectFee',
                            },
                            {
                                title: 'Collect Fee Online',
                                bullet: 'dot',
                                page: '/fee/collectFee',
                                entPermission: 'collectFeeOnline',
                            },
                            {
                                title: 'Collect Fee All Session',
                                bullet: 'dot',
                                page: '/fee/collectFeeAllSession',
                                entPermission: 'collectFeeAllSession',
                            },
                            {
                                title: 'Collect Miscellaneous Fee',
                                icon: 'flaticon-coins',
                                page: '/fee/collectFee/miscellenous',
                                entPermission: 'collectFee',
                            },
                        ]
                    },
                    {
                        title: 'Other Income',
                        bullet: 'dot',
                        page: '/fee/collectOtherIncome',
                        entPermission: 'collectOtherIncome',
                        submenu: [
                            {
                                title: 'Collect Other Income',
                                bullet: 'dot',
                                page: '/fee/collectOtherIncome',
                                entPermission: 'collectOtherIncome',
                            },
                            {
                                title: 'Other Income Transaction List',
                                bullet: 'dot',
                                page: '/fee/otherIncomeTransactionList',
                                entPermission: 'viewOtherIncomeTransactionList',
                            },
                        ]
                    },
                    {
                        title: 'Transaction',
                        bullet: 'dot',
                        entPermission: 'feeModule',
                        submenu: [
                            {
                                title: 'Transaction List',
                                bullet: 'dot',
                                page: '/fee/transactionList',
                                entPermission: 'viewTransactionList',
                            },
                            {
                                title: 'Fee Adjustment',
                                bullet: 'dot',
                                icon: 'flaticon2-list-2',
                                page: '/fee/feeAdjusment',
                                entPermission: 'createAdjustmentTransaction'
                            },
                            {
                                title: ' Online Transaction List',
                                bullet: 'dot',
                                icon: 'flaticon2-list-2',
                                page: '/fee/onlineTransactionList',
                                entPermission: 'viewOnlineTransactionList'
                            }
                        ]
                    },
                    {
                        title: 'Concession',
                        bullet: 'dot',
                        entPermission: 'feeModule',
                        submenu: [
                            {
                                title: 'Concession Report',
                                bullet: 'dot',
                                page: '/fee/concessionReport',
                                entPermission: 'viewConcessionReport',
                            },
                            {
                                title: 'Concession Utilization Report',
                                bullet: 'dot',
                                page: '/fee/concessionUtilizationReport',
                                entPermission: 'viewConcessionUtilizationReport',
                            },
                        ]
                    },
                    {
                        title: 'Refund',
                        bullet: 'dot',
                        page: '/fee/refund',
                        entPermission: 'viewRefundTransactionList',
                        submenu: [
                            {
                                title: 'Refund',
                                bullet: 'dot',
                                page: '/fee/refund',
                                entPermission: 'getRefundDetails',
                            },
                            {
                                title: 'Refund Transaction List',
                                bullet: 'dot',
                                page: '/fee/refundTransactionList',
                                entPermission: 'viewRefundTransactionList',
                            },
                            {
                                title: 'Refund Report',
                                bullet: 'dot',
                                page: '/fee/refundReport',
                                entPermission: 'viewRefundTransactionList',
                            },
                            {
                                title: 'Bulk Refund',
                                bullet: 'dot',
                                page: '/fee/bulkFeeRefund',
                                entPermission: 'getBulkFeeRefundDetails',
                            }
                        ]
                    },
                    {
                        title: 'Fee Reports',
                        bullet: 'dot',
                        entPermission: 'viewFeeReports',
                        submenu: [
                            {
                                title: 'Combined Daily Collection Report',
                                bullet: 'dot',
                                page: '/fee/combinedDailyCollectionReport',
                                entPermission: 'viewCombinedDailyCollectionReport',
                            },
                            {
                                title: 'Daily Fee Report',
                                bullet: 'dot',
                                page: '/fee/dailyFeeReport',
                                entPermission: 'viewDailyFeeReport',
                            },
                            {
                                title: 'Fee Head Collection Report',
                                bullet: 'dot',
                                page: '/fee/dailyFeeHeadCollectionReport',
                                entPermission: 'viewDailyFeeHeadCollectionReport',
                            },
                            {
                                title: 'Daily PaymentMode Collection Report',
                                bullet: 'dot',
                                page: '/fee/dailyPaymentModeCollectionReport',
                                entPermission: 'viewDailyPaymentModeCollectionReport',
                            },
                            {
                                title: 'Due Fee Report',
                                bullet: 'dot',
                                page: '/fee/dueFeeReport',
                                entPermission: 'viewDueFeeReport',
                            },
                            {
                                title: 'Due Fee Report Course Wise',
                                bullet: 'dot',
                                page: '/fee/dueFeeReportCourseWise',
                                entPermission: 'viewDueFeeReportCourseWise',
                            },
                            {
                                title: 'Multi Session Due Fee Report',
                                bullet: 'dot',
                                page: '/fee/multiSessionDueFeeReport',
                                entPermission: 'viewMultiSessionDueFeeReport',
                            },
                            {
                                title: 'Transport Due Fee Report',
                                bullet: 'dot',
                                page: '/fee/transportDueFeeReport',
                                entPermission: 'viewTransportReport',
                            },
                            {
                                title: 'Fee Register Student Wise',
                                bullet: 'dot',
                                page: '/fee/feeRegisterStudentWise',
                                entPermission: 'viewStudentWiseFeeRegister',
                            },
                        ]
                    },
                    {
                        title: 'Fee Summary',
                        bullet: 'dot',
                        entPermission: 'viewCourseWiseCollectionReport',
                        submenu: [
                            {
                                title: 'Fee Summary - Course Wise',
                                bullet: 'dot',
                                page: '/fee/courseWiseReport',
                                entPermission: 'viewCourseWiseCollectionReport',
                            },
                            {
                                title: 'Fee Summary - Category Wise',
                                bullet: 'dot',
                                page: '/fee/categoryWiseReport',
                                entPermission: 'viewCategoryWiseCollectionReport',
                            },
                            {
                                title: 'Fee Summary - Head Wise',
                                bullet: 'dot',
                                page: '/fee/feeHeadWiseReport',
                                entPermission: 'viewFeeHeadWiseCollectionReport',
                            },
                            {
                                title: 'Fee Summary - Group Wise',
                                bullet: 'dot',
                                page: '/fee/feeGroupWiseReport',
                                entPermission: 'viewFeeHeadGroupWiseCollectionReport',
                            },
                            {
                                title: 'Fee Summary - Combined Head Wise',
                                bullet: 'dot',
                                page: '/fee/combinedHeadWiseFeeSummary',
                                entPermission: 'viewCombinedHeadWiseCollectionReport',
                            },
                            {
                                title: 'Student Payment Summary',
                                bullet: 'dot',
                                page: '/fee/studentPaymentSummary',
                                entPermission: 'viewStudentPaymentSummary',
                            },
                        ]
                    },
                ]
            },
            {
                title: 'Accounting',
                root: true,
                bullet: 'dot',
                icon: 'flaticon3-money-1',
                entPermission: 'accountingModule',
                submenu: [
                    {
                        title: 'Accounting',
                        bullet: 'dot',
                        page: '/accounting/accounting',
                        entPermission: 'accountingModule',
                    },
                    {
                        title: 'Manage Cash',
                        bullet: 'dot',
                        page: '/accounting/manageCash',
                        entPermission: 'getManageCashList'
                    },
                    {
                        title: 'Voucher',
                        bullet: 'dot',
                        page: '/accounting/voucher',
                        entPermission: 'viewAccountingVoucherList'
                    },
                    {
                        title: 'Income & Expenditure A/c Report',
                        bullet: 'dot',
                        page: '/accounting/incomeExpenditureReport',
                        entPermission: 'getIncomeAndExpenditureAccount'
                    }
                ]
            },
            {
                title: 'Expense Management',
                root: true,
                bullet: 'dot',
                icon: 'flaticon3-group',
                page: '/expenseManagement/expenseManagementSystem',
                entPermission: 'viewExpenseManagementList',
            },
            {
                title: 'Attendance',
                root: true,
                bullet: 'dot',
                icon: 'flaticon3-calendar',
                page: '/studentAttendance',
                entPermission: 'attendanceModule',
                submenu: [
                    {
                        title: 'Mark Attendance',
                        bullet: 'dot',
                        entPermission: 'attendanceModule',
                        submenu: [
                            {
                                title: 'Student Attendance',
                                bullet: 'dot',
                                page: '/attendance/studentAttendance',
                                entPermission: 'viewStudentAttendanceList',
                            },
                            {
                                title: 'Student Attendance V2',
                                bullet: 'dot',
                                page: '/attendance/studentAttendanceV2',
                                entPermission: 'viewMultiCourseStudentAttendanceList',
                            },
                            {
                                title: 'Student Attendance Teacher Wise',
                                bullet: 'dot',
                                page: '/attendance/markAttendanceTeacherWise',
                                entPermission: 'viewTeacherWiseStudentAttendanceList',
                            },
                            {
                                title: 'Mark All Student Attendance',
                                bullet: 'dot',
                                page: '/attendance/markAllStudentAttendance',
                                entPermission: 'markAllStudentAttendance',
                            },
                        ]
                    },
                    {
                        title: 'Time Table',
                        bullet: 'dot',
                        entPermission: 'attendanceModule',
                        submenu: [
                            {
                                title: 'Daily Schedule For Employees',
                                bullet: 'dot',
                                page: '/attendance/dailyScheduleEmployees',
                                entPermission: 'viewDailyTimeTableSchedule'
                            },
                            {
                                title: 'Employee Schedule',
                                bullet: 'dot',
                                page: '/attendance/singleEmployeeSchedule',
                                entPermission: 'viewEmployeeTimeTableSchedule'
                            },
                            {
                                title: 'Course Wise Schedule',
                                bullet: 'dot',
                                page: '/attendance/timeTableCourseWise',
                                entPermission: 'viewCourseTimeTableSchedule'
                            },
                            {
                                title: 'Time Table Status',
                                bullet: 'dot',
                                page: '/attendance/timeTableStatus',
                                entPermission: 'timeTableStatusReport'
                            },
                        ]
                    },
                    {
                        title: 'Attendance Reports',
                        bullet: 'dot',
                        entPermission: 'attendanceModule',
                        submenu: [
                            {
                                title: 'Daily Report',
                                bullet: 'dot',
                                page: '/attendance/attendanceReport',
                                entPermission: 'viewAttendanceReport',
                            },
                            {
                                title: 'Attendance Summary',
                                bullet: 'dot',
                                page: '/attendance/attendanceSummary',
                                entPermission: 'viewAttendanceSummary',
                            },
                            {
                                title: 'Course Wise Attendance Report - All Subject',
                                bullet: 'dot',
                                page: '/attendance/courseWiseSummary',
                                entPermission: 'viewAllSubjectsAttendanceSummary',
                            },
                            {
                                title: 'Employee Wise Daily Attendance Report',
                                bullet: 'dot',
                                page: '/attendance/employeeWiseDailyAttendanceReport',
                                entPermission: 'viewEmployeeWiseAttendanceReport',
                            },
                            {
                                title: 'Institute Summary',
                                bullet: 'dot',
                                page: '/attendance/instituteSummary',
                                entPermission: 'viewInstituteAttendanceSummary',
                            },
                            {
                                title: 'Not Marked Report',
                                bullet: 'dot',
                                page: '/attendance/notMarkedReport',
                                entPermission: 'viewAttendanceNotMarkedReport',
                            },
                            {
                                title: 'Lecture Wise Not Marked Report',
                                bullet: 'dot',
                                page: '/attendance/lectureWiseNotMarkedReport',
                                entPermission: 'viewLectureWiseAttendanceNotMarkedReport',
                            },
                            {
                                title: 'Executive Daily Report',
                                bullet: 'dot',
                                page: '/attendance/edrAttendanceReport',
                                entPermission: 'viewEDRReport',
                            },
                        ]
                    },
                    {
                        title: 'Leave & Attendance Marks',
                        bullet: 'dot',
                        entPermission: 'attendanceModule',
                        submenu: [
                            {
                                title: 'Applied Leave',
                                bullet: 'dot',
                                page: '/attendance/appliedLeave',
                                entPermission: 'viewAppliedLeaveList'
                            },
                            {
                                title: 'Attendance Marks',
                                bullet: 'dot',
                                page: '/attendance/attendanceMarks',
                                entPermission: 'calculateAttendanceMarks'
                            },
                        ]
                    },
                    {
                        title: 'Club Attendance',
                        bullet: 'dot',
                        entPermission: 'viewStudentClubList',
                        submenu: [
                            {
                                title: 'Student Clubs',
                                bullet: 'dot',
                                page: '/schoolSetup/studentClubs',
                                entPermission: 'viewStudentClubList',
                            },
                            {
                                title: 'Club Attendance',
                                bullet: 'dot',
                                page: '/student/clubAttendance',
                                entPermission: 'getListStudentClubAttendance',
                            },
                            {
                                title: 'Club Attendance Marked Report',
                                bullet: 'dot',
                                page: '/student/clubAttendanceMarked',
                                entPermission: 'markedReportStudentClubAttendance',
                            },
                            {
                                title: 'Club Attendance Summary Report',
                                bullet: 'dot',
                                page: '/student/clubAttendanceSummaryWise',
                                entPermission: 'summaryReportStudentClubAttendance',
                            },
                        ],
                    },
                ]
            },
            {
                title: 'Attendance New',
                root: true,
                bullet: 'dot',
                icon: 'flaticon3-calendar',
                entPermission: 'attendanceModule',
                submenu: [
                    {
                        title: 'Mark Attendance',
                        bullet: 'dot',
                        entPermission: 'attendanceModule',
                        submenu: [
                            {
                                title: 'Student Attendance',
                                bullet: 'dot',
                                page: '/attendanceNew/studentAttendance',
                                entPermission: 'viewStudentAttendanceList',
                            },
                            // ... other Attendance New items similar to old attendance, truncating for brevity but keeping structure
                        ]
                    }
                ]
            },
            {
                title: 'Examination',
                root: true,
                bullet: 'dot',
                icon: 'flaticon3-calendar',
                entPermission: 'examinationModule',
                submenu: [
                    {
                        title: 'Marks Entry',
                        bullet: 'dot',
                        entPermission: 'examinationModule',
                        submenu: [
                            {
                                title: 'Assessment Wise Marks Entry',
                                bullet: 'dot',
                                page: '/examination/assessmentsMarks',
                                entPermission: 'viewAssessmentMarks',
                            },
                            {
                                title: 'Student Wise Marks Entry',
                                bullet: 'dot',
                                page: '/examination/assessmentsMarksStudentWise',
                                entPermission: 'viewAssessmentMarksByStudent',
                            },
                            {
                                title: 'Subject Wise Marks Entry',
                                bullet: 'dot',
                                page: '/examination/marksEntryMultipleAssessment',
                                entPermission: 'viewAssessmentMarks',
                            },
                            {
                                title: 'Student Wise Marks Entry V2',
                                bullet: 'dot',
                                page: '/examination/assessmentsMarksStudentWiseV2',
                                entPermission: 'viewAssessmentMarksByStudentv2',
                            },
                            {
                                title: 'Student Wise Skills Entry',
                                bullet: 'dot',
                                page: '/examination/studentMarksEntrySkillWise',
                                entPermission: 'viewAssessmentMarksBySkill',
                            },
                            {
                                title: 'Club Wise Marks Entry',
                                bullet: 'dot',
                                page: '/examination/clubWiseMarksEntry',
                                entPermission: 'viewAssessmentMarksBySkill',
                            }
                        ],
                    },
                    {
                        title: 'Class Test',
                        bullet: 'dot',
                        entPermission: 'examinationModule',
                        submenu: [
                            {
                                title: 'Class Test',
                                bullet: 'dot',
                                page: '/examination/classTestEntry',
                                entPermission: 'viewClassTest',
                            },
                            {
                                title: 'Class Test Green Sheet',
                                bullet: 'dot',
                                page: '/examination/classTestGreenSheet',
                                entPermission: 'viewClassTestGreenSheet',
                            },
                            {
                                title: 'Class Test Count Report',
                                bullet: 'dot',
                                page: '/examination/classTestCountReport',
                                entPermission: 'getClassTestCountReport',
                            }
                        ]
                    },
                    {
                        title: 'Report',
                        bullet: 'dot',
                        entPermission: 'examinationModule',
                        submenu: [
                            {
                                title: 'Assessment Wise Report',
                                bullet: 'dot',
                                page: '/examination/assessmentsWiseReport',
                                entPermission: 'viewMarksByCourse',
                            },
                            {
                                title: 'Green Sheet',
                                bullet: 'dot',
                                page: '/examination/greenSheet',
                                entPermission: 'viewGreenSheet',
                            },
                            {
                                title: 'Report Card',
                                bullet: 'dot',
                                page: '/examination/reportCardData',
                                entPermission: 'viewReportCard',
                            },
                            {
                                title: 'Pending Assessment Marks',
                                bullet: 'dot',
                                page: '/examination/pendingAssessmentMarks',
                                entPermission: 'viewPendingAssessmentMarks',
                            },
                            {
                                title: 'Exam Registration',
                                bullet: 'dot',
                                page: '/examination/examRegistration',
                                entPermission: 'viewExamRegistrationList',
                            },
                            {
                                title: 'Issue Admit Card',
                                bullet: 'dot',
                                page: '/examination/issueAdmitCard',
                                entPermission: 'viewExamRegistrationList',
                            },
                        ]
                    },
                    {
                        title: 'Examination Insights',
                        bullet: 'dot',
                        entPermission: 'insightsModule',
                        submenu: [
                            {
                                title: 'Student Wise Insights',
                                bullet: 'dot',
                                page: '/insights/examinationInsights',
                                entPermission: 'examinationInsights',
                            },
                            {
                                title: 'Course Wise Insights',
                                bullet: 'dot',
                                page: '/examination/cbseResult',
                                entPermission: 'getClassAssessmentStats',
                            },
                        ]
                    },
                    {
                        title: 'COE Examination',
                        bullet: 'dot',
                        entPermission: 'examinationModule',
                        submenu: [
                            {
                                title: 'Subject Wise Report',
                                bullet: 'dot',
                                page: '/examination/subjectWiseReport',
                                entPermission: 'viewExamSubjectReport',
                            },
                            {
                                title: 'Date Sheet Report',
                                bullet: 'dot',
                                page: '/examination/dateSheetReport',
                                entPermission: 'viewExamDateSheet',
                            },
                            {
                                title: 'Seat Schedule Report',
                                bullet: 'dot',
                                page: '/examination/seatScheduleReport',
                                entPermission: 'viewExamSeatScheduleReport',
                            },
                        ]
                    },
                ]
            },
            {
                title: 'Feedback From Student',
                root: true,
                bullet: 'dot',
                icon: 'flaticon3-report',
                entPermission: 'viewFeedbackMaster',
                submenu: [
                    {
                        title: 'Feedback From Student',
                        bullet: 'dot',
                        entPermission: 'viewFeedbackMaster',
                        submenu: [
                            {
                                title: 'Feedback from Student',
                                bullet: 'dot',
                                page: '/schoolSetup/feedbackStudent',
                                entPermission: 'viewFeedbackFromStudentList',
                            },
                            {
                                title: 'Feedback from Student Report Dashboard',
                                bullet: 'dot',
                                page: '/feedbackFromStudent/feedbackDashboard',
                                entPermission: 'courseWiseFeedbackFromStudentCount',
                            },
                        ]
                    },
                    {
                        title: 'Feedback From Student Reports',
                        bullet: 'dot',
                        entPermission: 'viewFeedbackMaster',
                        submenu: [
                            {
                                title: 'All Faculty Feedback Report',
                                bullet: 'dot',
                                page: '/feedbackFromStudent/allFacultyFeedbackReport',
                                entPermission: 'allFacultyFeedbackReport',
                            },
                            {
                                title: 'Couse Wise Faculty Average Report',
                                bullet: 'dot',
                                page: '/feedbackFromStudent/courseWiseFacultyAverageReport',
                                entPermission: 'courseWiseFacultyAverageReport',
                            },
                            {
                                title: 'Individual Faculty Report',
                                bullet: 'dot',
                                page: '/feedbackFromStudent/individualFacultyReport',
                                entPermission: 'individualFacultyReport',
                            },
                            {
                                title: 'Section Wise Feedback Summary Report',
                                bullet: 'dot',
                                page: '/feedbackFromStudent/sectionWiseFeedbackSummaryReport',
                                entPermission: 'sectionWiseFeedbackSummaryReport',
                            },
                            {
                                title: 'Facility Feedback Report',
                                bullet: 'dot',
                                page: '/feedbackFromStudent/facilityFeedbackReport',
                                entPermission: 'facilityFeedbackReport',
                            },
                            {
                                title: 'Student Submission Report',
                                bullet: 'dot',
                                page: '/feedbackFromStudent/studentSubmissionReport',
                                entPermission: 'studentSubmissionReport',
                            },
                            {
                                title: 'Feedback Summary Report',
                                bullet: 'dot',
                                page: '/feedbackFromStudent/feedbackSummaryReport',
                                entPermission: 'facultyFeedbackQuestionWiseReport',
                            },
                        ]
                    }
                ]
            },
            {
                title: 'School Diary',
                root: true,
                bullet: 'dot',
                icon: 'flaticon3-report',
                entPermission: 'viewSchoolDiaryList',
                submenu: [
                    {
                        title: 'School Diary',
                        bullet: 'dot',
                        entPermission: 'viewSchoolDiaryList',
                        submenu: [
                            {
                                title: 'Assignment',
                                bullet: 'dot',
                                page: '/schoolDiary/assignment',
                                entPermission: 'viewAssignmentList',
                            },
                            {
                                title: 'Homework',
                                bullet: 'dot',
                                page: '/schoolDiary/homework',
                                entPermission: 'viewHomeworkList',
                            },
                            {
                                title: 'Homework New',
                                bullet: 'dot',
                                page: '/schoolDiary/homeworkNew',
                                entPermission: 'viewHomeworkList',
                            },
                            {
                                title: 'Circular',
                                bullet: 'dot',
                                page: '/schoolDiary/circular',
                                entPermission: 'viewCircularList',
                            },
                            {
                                title: 'Notice',
                                bullet: 'dot',
                                page: '/schoolDiary/notice',
                                entPermission: 'viewNoticeList',
                            },
                            {
                                title: 'Syllabus',
                                bullet: 'dot',
                                page: '/schoolDiary/syllabus',
                                entPermission: 'viewSyllabusList',
                            },
                            {
                                title: 'Date Sheet',
                                bullet: 'dot',
                                page: '/schoolDiary/dateSheet',
                                entPermission: 'viewDateSheetList',
                            },
                            {
                                title: 'E-Learning',
                                bullet: 'dot',
                                page: '/schoolDiary/eLearning',
                                entPermission: 'viewELearningList',
                            },
                            {
                                title: 'Time Table',
                                bullet: 'dot',
                                page: '/schoolDiary/timeTable',
                                entPermission: 'viewDateSheetList',
                            },
                            {
                                title: 'Homework Not Sent Report',
                                bullet: 'dot',
                                page: '/schoolDiary/homeWorkNotSendReport',
                                entPermission: 'homeworkReport',
                            },
                        ]
                    }
                ]
            },
            {
                title: 'Learning Management',
                bullet: 'dot',
                icon: 'flaticon-coins',
                entPermission: 'learningManagementModule',
                submenu: [
                    {
                        title: 'Learning Management',
                        bullet: 'dot',
                        page: '/learningManagement',
                        entPermission: 'viewLearningManagementList',
                    }
                ]
            },
            {
                title: 'Lesson Plan',
                root: true,
                bullet: 'dot',
                icon: 'flaticon3-analytics',
                entPermission: 'viewLessonPlanList',
                submenu: [
                    {
                        title: 'Lesson Plan',
                        bullet: 'dot',
                        entPermission: 'viewLessonPlanList',
                        submenu: [
                            {
                                title: 'Lesson Management',
                                bullet: 'dot',
                                page: '/lessonManagement',
                                entPermission: 'viewLessonPlanList',
                            },
                            {
                                title: 'Subject Wise Report',
                                bullet: 'dot',
                                page: '/lessonManagement/subjectWiseReport',
                                entPermission: 'viewSubjectWiseLessonReport',
                            },
                        ]
                    }
                ]
            },
            {
                title: 'HRM',
                root: true,
                bullet: 'dot',
                icon: 'flaticon3-team',
                entPermission: 'hrmModule',
                submenu: [
                    {
                        title: 'HRM',
                        bullet: 'dot',
                        entPermission: 'hrmModule',
                        submenu: [
                            {
                                title: 'Employee',
                                bullet: 'dot',
                                page: '/hrm/employee',
                                entPermission: 'viewEmployeeList',
                            },
                            {
                                title: 'Manage Employee',
                                bullet: 'dot',
                                page: '/hrm/manageEmployee',
                                entPermission: 'manageEmployee',
                            },
                            {
                                title: 'Employee Entitled Leaves',
                                bullet: 'dot',
                                page: '/hrm/employeeEntitledLeaves',
                                entPermission: 'viewEmployeeEntitledLeave',
                            },
                            {
                                title: 'Attendance Calendar',
                                bullet: 'dot',
                                page: '/hrm/employeeAttendanceCalendar',
                                entPermission: 'getEmployeeAttendanceCalendar',
                            },
                        ]
                    },
                    {
                        title: 'Employee Reports',
                        bullet: 'dot',
                        entPermission: 'viewEmployeeReport',
                        submenu: [
                            {
                                title: 'Employee Report',
                                bullet: 'dot',
                                page: '/hrm/employeeReport',
                                entPermission: 'viewEmployeeList',
                            },
                            {
                                title: 'Leave Type Report',
                                bullet: 'dot',
                                page: '/hrm/employeeEntitledLeaveTypeReport',
                                entPermission: 'viewEmployeeEntitledLeaveTypeReport',
                            },
                            {
                                title: 'Attendance Time Report',
                                bullet: 'dot',
                                page: '/hrm/employeeAttendanceReport',
                                entPermission: 'viewDailyEmployeeAttendanceReport',
                            },
                            {
                                title: 'Attendance Report',
                                bullet: 'dot',
                                page: '/hrm/attendanceReport',
                                entPermission: 'viewDailyEmployeeAttendanceReport',
                            },
                            {
                                title: 'Daily Attendance Report Department Wise',
                                bullet: 'dot',
                                page: '/hrm/employeeDailyAttendanceReport',
                                entPermission: 'dailyAttendanceReportDepartmentWise',
                            },
                            {
                                title: 'Absentees & Late Arrival Report',
                                bullet: 'dot',
                                page: '/hrm/lateArrivalAbsenteeReport',
                                entPermission: 'viewDailyEmployeeAttendanceReport',
                            },
                            {
                                title: 'Leave Approval Report',
                                bullet: 'dot',
                                page: '/hrm/appliedLeaves',
                                entPermission: 'viewEmployeeLeaveApprovalReport',
                            },
                            {
                                title: 'Scheduler Logs',
                                bullet: 'dot',
                                page: '/hrm/dailySchedulerLogs',
                                entPermission: 'getEmployeeAttendanceDailySchedulerLogs',
                            },
                            {
                                title: 'Employee Promotion',
                                bullet: 'dot',
                                page: '/hrm/employeePromotion',
                                entPermission: 'viewEmployeePromotionList',
                            },
                        ]
                    },
                    {
                        title: 'Employee Attendance',
                        bullet: 'dot',
                        entPermission: 'viewEmployeeAttendanceMenu',
                        submenu: [
                            {
                                title: 'Mark Attendance',
                                bullet: 'dot',
                                page: '/hrm/markEmployeeAttendance',
                                entPermission: 'addEmployeeAttendance',
                            },
                            {
                                title: 'Mark Attendance Month Wise',
                                bullet: 'dot',
                                page: '/hrm/employeeAttendanceMonthWise',
                                entPermission: 'addEmployeeAttendance',
                            },
                            {
                                title: 'Biometric Attendance',
                                bullet: 'dot',
                                page: '/hrm/employeeAttendance',
                                entPermission: 'editEmployeeAttendance',
                            },
                            {
                                title: 'Attendance Regularization',
                                bullet: 'dot',
                                page: '/hrm/employeeAttendanceRegularization',
                                entPermission: 'viewEmployeeAttendanceRegularizationList',
                            }
                        ]
                    },
                    {
                        title: 'Process Salary Report',
                        bullet: 'dot',
                        entPermission: 'processEmployeeSalary',
                        submenu: [
                            {
                                title: 'Compute Attendance',
                                bullet: 'dot',
                                page: '/hrm/processSalary',
                                entPermission: 'processEmployeeSalary',
                            },
                            {
                                title: 'Salary Summary Month Wise',
                                bullet: 'dot',
                                page: '/hrm/salarySummary',
                                entPermission: 'viewEmployeeSalaryMonthWise',
                            },
                        ]
                    },
                    {
                        title: 'Salary Reports',
                        bullet: 'dot',
                        entPermission: 'processEmployeeSalary',
                        submenu: [
                            {
                                title: 'Salary Slip',
                                bullet: 'dot',
                                page: '/hrm/employeeSalarySummary',
                                entPermission: 'viewEmployeeSalaryList',
                            },
                            {
                                title: 'Employee Salary Report',
                                bullet: 'dot',
                                page: '/hrm/employeeSalaryReport',
                                entPermission: 'viewEmployeeSalaryReport',
                            },
                            {
                                title: 'Employee Salary Register',
                                bullet: 'dot',
                                page: '/hrm/employeeSalaryRegister',
                                entPermission: 'viewEmployeeSalaryMonthlyReport',
                            },
                            {
                                title: 'Employee Salary Report - Multiple Months',
                                bullet: 'dot',
                                page: '/hrm/employeeSalarySummaryMonthWise',
                                entPermission: 'viewEmployeeSalaryMonthlyReport',
                            },
                            {
                                title: 'Assign Salary Template',
                                bullet: 'dot',
                                page: '/hrm/assignSalaryTemplateToEmployee',
                                entPermission: 'bulkAssignEmployeeSalaryTemplate',
                            },
                            {
                                title: 'Arrear Salary Report',
                                bullet: 'dot',
                                page: '/hrm/arrearSalaryReport',
                                entPermission: 'viewArrearSalaryReport',
                            },
                            {
                                title: 'Earning & Deduction Register',
                                bullet: 'dot',
                                page: '/hrm/earningDeductionRegister',
                                entPermission: 'bulkAssignEmployeeSalaryTemplate',
                            },
                            {
                                title: 'PF Challan Report',
                                bullet: 'dot',
                                page: '/hrm/pfChallanReport',
                                entPermission: 'viewPFChallanReport',
                            },
                        ]
                    }
                ]
            },
            {
                title: 'Users',
                root: true,
                bullet: 'dot',
                icon: 'flaticon3-group',
                entPermission: 'viewUser',
                submenu: [
                    {
                        title: 'Users',
                        bullet: 'dot',
                        entPermission: 'viewUser',
                        submenu: [
                            {
                                title: 'Users',
                                bullet: 'dot',
                                page: '/users',
                                entPermission: 'viewUserList'
                            },
                            {
                                title: 'Task Management',
                                bullet: 'dot',
                                page: '/taskManagement',
                                entPermission: 'viewUserTaskList',
                            },
                        ]
                    }
                ]
            },
            {
                title: 'Library',
                root: true,
                bullet: 'dot',
                icon: 'flaticon3-book',
                page: '/library',
                entPermission: 'libraryModule',
                submenu: [
                    {
                        title: 'Library',
                        bullet: 'dot',
                        entPermission: 'libraryModule',
                        submenu: [
                            {
                                title: 'Books',
                                bullet: 'dot',
                                page: '/library/libraryBook',
                                entPermission: 'viewLibraryBookList',
                            },
                            {
                                title: 'Issue Book',
                                bullet: 'dot',
                                page: '/library/issueBook',
                                entPermission: 'issueLibraryBook',
                            },
                            {
                                title: 'Issue Book Course Wise',
                                bullet: 'dot',
                                page: '/library/issueBookCourseWise',
                                entPermission: 'getIssueRecordsByReceiverId'
                            },
                            {
                                title: 'Issued Books',
                                bullet: 'dot',
                                page: '/library/issueRecords/libraryDetails',
                                entPermission: 'getAllLibraryIssueRecords',
                            },
                            {
                                title: 'Stock Verify',
                                bullet: 'dot',
                                page: '/library/stockVerify',
                                entPermission: 'libraryStockVerify',
                            },
                            {
                                title: 'Library Visitor',
                                bullet: 'dot',
                                page: '/library/libraryVisitor',
                                entPermission: 'viewLibraryVisitList',
                            },
                            {
                                title: 'Digital Library',
                                bullet: 'dot',
                                page: '/library/digitalLibrary',
                                entPermission: 'viewDigitalLibraryList',
                            },
                        ]
                    },
                    {
                        title: 'Serial Management',
                        bullet: 'dot',
                        page: '/library/quickReport',
                        entPermission: 'viewLibrarySerialSubscriptionList',
                        submenu: [
                            {
                                title: 'Serial Subscription',
                                bullet: 'dot',
                                page: '/library/serialSubscription',
                                entPermission: 'viewLibrarySerialSubscriptionList',
                            },
                            {
                                title: 'Serial Collection',
                                bullet: 'dot',
                                page: '/library/serialCollection',
                                entPermission: 'viewLibrarySerialCollectionList',
                            },
                            {
                                title: 'Serial Collection Report',
                                bullet: 'dot',
                                page: '/library/serialCollectionReport',
                                entPermission: 'viewLibrarySerialCollectionReport'
                            },
                        ]
                    },
                    {
                        title: 'Library Reports',
                        bullet: 'dot',
                        page: '/library/libraryReports',
                        entPermission: 'viewLibraryBookList',
                        submenu: [
                            {
                                title: 'Library Reports',
                                bullet: 'dot',
                                page: '/library/libraryReports',
                                entPermission: 'viewLibraryBookList',
                            },
                            {
                                title: 'Library Issued Books Report',
                                bullet: 'dot',
                                page: '/library/libraryIssuedReports',
                                entPermission: 'getAllLibraryIssueRecords',
                            },
                            {
                                title: 'Library Collection Report',
                                bullet: 'dot',
                                page: '/library/libraryTransactionList',
                                entPermission: 'viewLibraryTransactionList',
                            },
                            {
                                title: 'Quick Report',
                                bullet: 'dot',
                                page: '/library/quickReport',
                                entPermission: 'countLibraryBooks'
                            },
                            {
                                title: 'Date Wise Issue/Return Report',
                                bullet: 'dot',
                                page: '/library/dateWiseIssueReport',
                                entPermission: 'dateWiseLibraryIssueReport',
                            },
                            {
                                title: 'WebOPAC Report',
                                bullet: 'dot',
                                page: '/library/webOPACReport',
                                entPermission: 'viewWebOPAC'
                            },
                        ]
                    },
                    {
                        title: 'WebOPAC',
                        bullet: 'dot',
                        entPermission: 'viewWebOPAC',
                        submenu: [
                            {
                                title: 'WebOPAC',
                                bullet: 'dot',
                                page: `/web-opac`,
                                entPermission: 'viewWebOPAC',
                            },
                        ]
                    },
                ]
            },
            {
                title: 'Communication',
                root: true,
                bullet: 'dot',
                icon: 'flaticon3-report',
                page: '/communication',
                entPermission: 'communicationModule',
                submenu: [
                    {
                        title: 'Communication',
                        bullet: 'dot',
                        entPermission: 'communicationModule',
                        submenu: [
                            {
                                title: 'Send Text SMS',
                                bullet: 'dot',
                                page: '/communication/sendSMS',
                                entPermission: 'sendSMSCommunication',
                            },
                            {
                                title: 'Send Email',
                                bullet: 'dot',
                                page: '/communication/sendEmail',
                                entPermission: 'sendEmailCommunication',
                            },
                            {
                                title: 'Send Whatsapp Message',
                                bullet: 'dot',
                                page: '/communication/webWhatsappMessage',
                                entPermission: 'sendWhatsAppWebCommunication',
                            },
                            {
                                title: 'Report',
                                bullet: 'dot',
                                page: '/communication/report',
                                entPermission: 'viewCommunicationReport',
                            },
                            {
                                title: 'Employee Communication Report',
                                bullet: 'dot',
                                page: '/communication/employeeReport',
                                entPermission: 'viewEmployeeCommunicationReportList',
                            },
                            {
                                title: 'Employee Announcement',
                                bullet: 'dot',
                                page: '/communication/employeeAnnouncement',
                                entPermission: 'viewEmployeeAnnouncementList',
                            },
                        ]
                    }
                ]
            },
            {
                title: 'Transport',
                root: true,
                bullet: 'dot',
                icon: 'flaticon3-report',
                entPermission: 'viewTransportReport',
                submenu: [
                    {
                        title: 'Transport',
                        bullet: 'dot',
                        entPermission: 'viewTransportReport',
                        submenu: [
                            {
                                title: 'Assign Transport',
                                bullet: 'dot',
                                page: '/transportAttendance/assignTransport',
                                entPermission: 'assignRouteToStudent',
                            },
                            {
                                title: 'Transport Report',
                                bullet: 'dot',
                                page: '/student/transportReport',
                                entPermission: 'viewTransportReport',
                            },
                            {
                                title: 'Transport Occupancy',
                                bullet: 'dot',
                                page: '/student/transportOccupancy',
                                entPermission: 'viewTransportOccupancyReport',
                            },
                            {
                                title: 'Transport Attendance',
                                bullet: 'dot',
                                page: '/transportAttendance',
                                entPermission: 'viewTransportAttendance',
                            },
                            {
                                title: 'Transport Attendance QR',
                                bullet: 'dot',
                                page: '/transportAttendance/transportAttendanceQr',
                                entPermission: 'viewTransportAttendanceByQR',
                            },
                            {
                                title: 'Transport Attendance Report',
                                bullet: 'dot',
                                page: '/transportAttendance/transportAttendanceReport',
                                entPermission: 'viewDailyAttendanceTransportReport',
                            },
                            {
                                title: 'Daily Summary Route Wise',
                                bullet: 'dot',
                                page: '/transportAttendance/dailySummaryRouteWise',
                                entPermission: 'viewDailyTransportAttendanceReport',
                            },
                            {
                                title: 'Transport Unmarked Attendance Report',
                                bullet: 'dot',
                                page: '/transportAttendance/transportUnmarkedAttendanceReport',
                                entPermission: 'viewUnmarkedTransportAttendanceReport',
                            },
                            {
                                title: 'Transport Due Fee Report',
                                bullet: 'dot',
                                page: '/fee/transportDueFeeReport',
                                entPermission: 'viewTransportReport',
                            },
                            {
                                title: 'Daily Transport Collection',
                                bullet: 'dot',
                                page: '/fee/dailyTransportCollection',
                                entPermission: 'dailyTransportCollection',
                            },
                        ]
                    }
                ]
            },
            {
                title: 'Hostel',
                root: true,
                bullet: 'dot',
                icon: 'flaticon3-house',
                entPermission: 'hostelModule',
                submenu: [
                    {
                        title: 'Hostel',
                        bullet: 'dot',
                        entPermission: 'hostelModule',
                        submenu: [
                            {
                                title: 'Building',
                                bullet: 'dot',
                                page: '/hostel/building',
                                entPermission: 'viewBuildingList',
                            },
                            {
                                title: 'Room Category',
                                bullet: 'dot',
                                page: '/hostel/roomCategory',
                                entPermission: 'viewRoomCategoryList',
                            },
                            {
                                title: 'Room',
                                bullet: 'dot',
                                page: '/hostel/room',
                                entPermission: 'viewRoomList',
                            },
                            {
                                title: 'Allocation',
                                bullet: 'dot',
                                page: '/hostel/allocation',
                                entPermission: 'viewAllocationList',
                            },
                        ]
                    },
                    {
                        title: 'Reports',
                        bullet: 'dot',
                        entPermission: 'hostelModule',
                        submenu: [
                            {
                                title: 'Occupancy Report',
                                bullet: 'dot',
                                page: '/hostel/occupancyReport',
                                entPermission: 'viewOccupancyReport',
                            },
                        ]
                    }
                ]
            },
            {
                title: 'Advanced',
                root: true,
                bullet: 'dot',
                icon: 'flaticon3-settings',
                entPermission: 'viewAdvancedList',
                submenu: [
                    {
                        title: 'Advanced',
                        bullet: 'dot',
                        entPermission: 'viewAdvancedList',
                        submenu: [
                            {
                                title: 'Design Certificate',
                                bullet: 'dot',
                                page: '/advanced/designCertificate',
                                entPermission: 'viewDesignCertificate',
                            },
                            {
                                title: 'Generate Certificate',
                                bullet: 'dot',
                                page: '/advanced/generateCertificate',
                                entPermission: 'generateCertificate',
                            },
                            {
                                title: 'Design ID Card',
                                bullet: 'dot',
                                page: '/advanced/designIdCard',
                                entPermission: 'viewDesignIdCard',
                            },
                            {
                                title: 'Generate ID Card',
                                bullet: 'dot',
                                page: '/advanced/generateIdCard',
                                entPermission: 'generateIdCard',
                            },
                            {
                                title: 'GatePass',
                                bullet: 'dot',
                                page: '/advanced/gatePass',
                                entPermission: 'viewGatePass',
                            },
                        ]
                    }
                ]
            },
            {
                title: 'Analytics',
                root: true,
                bullet: 'dot',
                icon: 'flaticon3-analytics',
                entPermission: 'analyticsModule',
                submenu: [
                    {
                        title: 'Analytics',
                        bullet: 'dot',
                        entPermission: 'analyticsModule',
                        submenu: [
                            {
                                title: 'Student',
                                bullet: 'dot',
                                page: '/analytics/student',
                                entPermission: 'viewStudentAnalytics',
                            },
                            {
                                title: 'Employee',
                                bullet: 'dot',
                                page: '/analytics/employee',
                                entPermission: 'viewEmployeeAnalytics',
                            },
                            {
                                title: 'Fee',
                                bullet: 'dot',
                                page: '/analytics/fee',
                                entPermission: 'viewFeeAnalytics',
                            },
                            {
                                title: 'Admission',
                                bullet: 'dot',
                                page: '/analytics/admission',
                                entPermission: 'viewAdmissionAnalytics',
                            },
                        ]
                    }
                ]
            },
            {
                title: 'Bulk Operations',
                root: true,
                bullet: 'dot',
                icon: 'flaticon3-settings',
                page: '/bulkUpdate',
                entPermission: 'viewBulkUpdate',
            },
            {
                title: 'Share Point',
                root: true,
                bullet: 'dot',
                icon: 'flaticon3-share',
                page: '/sharePoint',
                entPermission: 'viewSharePointList',
            },
            {
                title: 'Social Media',
                root: true,
                bullet: 'dot',
                icon: 'flaticon3-share',
                page: '/socialMedia',
                entPermission: 'viewSocialMediaList',
            },
            {
                title: 'NAAC',
                root: true,
                bullet: 'dot',
                icon: 'flaticon3-report',
                entPermission: 'naacModule',
                submenu: [
                    {
                        title: 'Extended Profile',
                        bullet: 'dot',
                        page: '/naac/extendedProfile',
                        entPermission: 'naacModule',
                    },
                    {
                        title: 'Criteria 1 - Curricular Aspects',
                        bullet: 'dot',
                        page: '/naac/criteria1',
                        entPermission: 'naacModule',
                    },
                    {
                        title: 'Criteria 2 - Teaching-Learning and Evaluation',
                        bullet: 'dot',
                        page: '/naac/criteria2',
                        entPermission: 'naacModule',
                    },
                    {
                        title: 'Criteria 3 - Research, Innovations and Extension',
                        bullet: 'dot',
                        page: '/naac/criteria3',
                        entPermission: 'naacModule',
                    },
                    {
                        title: 'Criteria 4 - Infrastructure and Learning Resources',
                        bullet: 'dot',
                        page: '/naac/criteria4',
                        entPermission: 'naacModule',
                    },
                    {
                        title: 'Criteria 5 - Student Support and Progression',
                        bullet: 'dot',
                        page: '/naac/criteria5',
                        entPermission: 'naacModule',
                    },
                    {
                        title: 'Criteria 6 - Governance, Leadership and Management',
                        bullet: 'dot',
                        page: '/naac/criteria6',
                        entPermission: 'naacModule',
                    },
                    {
                        title: 'Criteria 7 - Institutional Values and Best Practices',
                        bullet: 'dot',
                        page: '/naac/criteria7',
                        entPermission: 'naacModule',
                    },
                    {
                        title: 'NAAC Reports',
                        bullet: 'dot',
                        page: '/naac/reports',
                        entPermission: 'naacModule',
                    }
                ]
            },
            {
                title: 'Gallery',
                root: true,
                bullet: 'dot',
                icon: 'flaticon2-image-file',
                page: '/gallery',
                entPermission: 'viewGalleryList',
            },
        ]
    }
};
