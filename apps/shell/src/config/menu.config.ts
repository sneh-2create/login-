
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
            // Add more admin items based on original config
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
                entPermission: 'viewEntityDashboard'
            },
            {
                title: 'Student',
                root: true,
                alignment: 'left',
                page: '/student/studentList',
                entPermission: 'viewStudentList',
                icon: 'flaticon3-graduated',
                submenu: [
                    {
                        title: 'Student List',
                        bullet: 'dot',
                        icon: 'flaticon3-graduated',
                        page: '/student/studentList',
                        entPermission: 'viewStudentList',
                    },
                    {
                        title: 'Admission',
                        page: '/admission',
                        entPermission: 'admissionModule',
                        icon: 'flaticon-interface-10',
                        submenu: [
                            // Admission submenus
                        ]
                    }
                ]
            },
            {
                title: 'Fee',
                root: true,
                alignment: 'left',
                // page: '/feeReports',
                entPermission: 'feeModule',
                icon: 'flaticon-coins',
                // toggle: 'click',
                submenu: [
                    {
                        title: 'Collect Fee',
                        // bullet: 'dot',
                        icon: 'flaticon-coins',
                        page: '/fee/collectFee',
                        entPermission: 'collectFee',
                    },
                    {
                        title: 'Fee Reports',
                        icon: 'flaticon-notepad',
                        entPermission: 'viewFeeReports',
                        submenu: [
                            {
                                title: 'Daily Fee Report',
                                page: '/fee/dailyFeeReport',
                                entPermission: 'viewDailyFeeReport'
                            }
                        ]
                    }
                ]
            }
        ]
    }
};
