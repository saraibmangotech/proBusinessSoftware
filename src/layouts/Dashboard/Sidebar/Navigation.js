const Navigation = [
	{
		name: "dashboard",
		icon: "home",
		route: "/dashboard",
		userType: "",
		childRoute: [""],
		children: [

		],
	},
	{
		name: "Customer Management",
		sidebarName: "Customer Management",
		icon: "customer",

		route: '/customer-list',
		userType: "A",
		childRoute: [],
		children: [


		],
	},
	{
		name: "Commission Management",
		sidebarName: "Commission Management",
		icon: "customer",

		route: '/commission-list',
		userType: "A",
		childRoute: [],
		children: [


		],
	},
	{
		name: "Customer Detail",
		sidebarName: "Customer Detail",
		icon: "customer",

		route: '/customer-detail',
		userType: "A",
		childRoute: [],
		children: [


		],
	},
	{
		name: "Visa Requests Management",
		sidebarName: "Visa Requests Management",
		icon: "customer",

		route: '/visa-list',
		userType: "A",
		childRoute: [],
		children: [


		],
	},
	{
		name: "Admin Approval",
		sidebarName: "Admin Approval",
		icon: "customer",

		route: '/admin-approval',
		userType: "A",
		childRoute: [],
		children: [


		],
	},
	{
		name: "Draft Visa Request",
		sidebarName: "Draft Visa Request",
		icon: "customer",

		route: '/draft-visa',
		userType: "A",
		childRoute: [],
		children: [


		],
	},

	{
		name: "Visa Processing Management",
		sidebarName: "Visa Processing Management",
		icon: "customer",

		route: '/visa-processing-list',
		userType: "A",
		childRoute: [
			{
				name: "Rejected Visa List",
				route: "/rejected-visa-list",
				childRoute: [
					
				],
			},
			{
				name: "Active Visa List",
				route: "/active-visa-list",
				childRoute: [
					{
						name: "Renewed Visa List",
						route: "/renew-visa-list",
					},
					{
						name: "Cancelled Visa List",
						route: "/cancelled-visa-list",
					},
					{
						name: "Absconder Visa List",
						route: "/absconder-visa-list",
					},
				],
			},
		],
		children: [
			{
				name: "Rejected Visa List",
				route: "/rejected-visa-list",
				childRoute: [
					
				],
			},
			{
				name: "Active Visa List",
				route: "/active-visa-list",
				sidebarName: "Active Visa List",
				children: [
					{
						name: "Renewed Visa List",
						route: "/renew-visa-list",
						sidebarName: "Renewed Visa List",
					},
					{
						name: "Cancelled Visa List",
						route: "/cancelled-visa-list",
						sidebarName: "Cancelled Visa List",
					},
					{
						name: "Absconder Visa List",
						route: "/absconder-visa-list",
						sidebarName: "Absconder Visa List",
					},
				],
			},
		],
	},
	{
		name: "Salary Certificate",
		sidebarName: "Salary Certificate",
		icon: "customer",

		route: '/salary-certificate',
		userType: "A",
		childRoute: [],
		children: [


		],
	},
	{
		name: "Add On Service",
		sidebarName: "Add On Service",
		icon: "setting",

		userType: "A",
		childRoute: [{
			name: 'Service Invoice',
			route: '/service-invoice'
		}, {
			name: 'Create Service Invoice',
			route: '/create-service-invoice',
		}],
		children: [
			{
				name: 'Service Invoice',
				route: '/service-invoice',
				sidebarName: 'Service Invoice'
			},
			{
				name: 'Create Service Invoice',
				route: '/create-service-invoice',
				sidebarName: 'Create Service Invoice'
			}

		],
	},
	{
		name: "Invoicing & Payments",
		sidebarName: "Invoicing & Payments",
		icon: "setting",

		userType: "A",
		childRoute: [{
			name: 'Create Monthly Service Invoice',
			route: '/create-monthly-invoice'
		}, {
			name: 'Monthly Invoices',
			route: '/monthly-invoices',
			sidebarName: 'Monthly Invoices'
		}, {
			name: 'Invoices',
			route: '/invoices',
			sidebarName: 'Invoices'
		}, {
			name: 'Payments',
			route: '/payments',
			sidebarName: 'Payments'
		}],
		children: [
			{
				name: 'Create Monthly Service Invoice',
				route: '/create-monthly-invoice'
			},
			{
				name: 'Monthly Invoices',
				route: '/monthly-invoices',
				sidebarName: 'Monthly Invoices'
			}, {
				name: 'Invoices',
				route: '/invoices',
				sidebarName: 'Invoices'
			}
			, {
				name: 'Payments',
				route: '/payments',
				sidebarName: 'Payments'
			}

		],
	},
	{
		name: "Reports",
		sidebarName: "Reports",
		icon: "setting",

		userType: "A",
		childRoute: [{
			name: 'Visa Sales Report',
			route: '/visa-sales-report'
		}, {
			name: 'Customer Account Receivable Aging Report',
			route: '/receivable-aging',
			sidebarName: 'Customer Account Receivable Aging Report'
		}, {
			name: 'Monthly Billing Revenue',
			route: '/monthly-billing-revenue',
			sidebarName: 'Monthly Billing Revenue'
		}, {
			name: 'Customer Vise Total Visa',
			route: '/customer-vise-total-visa',
			sidebarName: 'Customer Vise Total Visa'
		}, {
			name: 'Customer Vise Request List',
			route: '/customer-vise-request-list',
			sidebarName: 'Customer Vise Request List'
		},
	     {
			name: 'Customer Vise Report',
			route: '/customer-vise-report',
			sidebarName: 'Customer Vise Report'
		},
		{
			name: 'Customer Vise Billing Report',
			route: '/customer-vise-billng-report',
			sidebarName: 'Customer Vise Billing Report'
		},
		{
			name: 'Master Report',
			route: '/master-report',
			sidebarName: 'Master Report'
		}],
		children: [
			{
				name: 'Visa Sales Report',
				route: '/visa-sales-report'
			},
			{
				name: 'Customer Account Receivable Aging Report',
				route: '/receivable-aging',
				sidebarName: 'Customer Account Receivable Aging Report'
			}, {
				name: 'Monthly Billing Revenue',
				route: '/monthly-billing-revenue',
				sidebarName: 'Monthly Billing Revenue'
			}
			, {
				name: 'Customer Vise Total Visa',
				route: '/customer-vise-total-visa',
				sidebarName: 'Customer Vise Total Visa'
			}, {
				name: 'Customer Vise Request List',
				route: '/customer-vise-request-list',
				sidebarName: 'Customer Vise Request List'
			},
			{
				name: 'Customer Vise Report',
				route: '/customer-vise-report',
				sidebarName: 'Customer Vise Report'
			},
			{
				name: 'Customer Vise Billing Report',
				route: '/customer-vise-billng-report',
				sidebarName: 'Customer Vise Billing Report'
			},
			{
				name: 'Agent Vise Billing Report',
				route: '/agent-vise-billng-report',
				sidebarName: 'Agent Vise Billing Report'
			},
			{
				name: 'Agent Vise Visa Report',
				route: '/agent-vise-visa-report',
				sidebarName: 'Agent Vise Visa Report'
			},
			{
				name: 'Master Report',
				route: '/master-report',
				sidebarName: 'Master Report'
			}

		],
	},
	{
		name: "WPS Management",
		sidebarName: "WPS Management",
		icon: "customer",

		route: '/wps-list',
		userType: "A",
		childRoute: [],
		children: [


		],
	},

	{
		name: "Accounts Management",
		sidebarName: "Accounts Management",
		icon: "customer",

		userType: "A",
		childRoute: [{
			name: 'Create Journal Voucher',
			route: '/create-journal-voucher'
		},{
			name: 'Journal Vouchers',
			route: '/journal-voucher-list'
		},{
			name: 'Account List',
			route: '/accounts-list'
		},
		
		{
			name: 'Account Ledger',
			route: '/general-ledger'
		},
		{
			name: 'General Journal Ledger',
			route: '/general-journal-ledger'
		}, {
			name: 'Chart Of Accounts',
			route: '/chart-of-accounts'
		}, {
			name: 'Trial Balance',
			route: '/trial-balance'
		}, {
			name: 'Profit Loss Statement',
			route: '/profit-loss-statement'
		}, {
			name: 'Profit Loss Visa Report',
			route: '/profit-loss-visa-report'
		}, {
			name: 'Balance Sheet',
			route: '/balance-sheet'
		}],
		children: [

			{
				name: 'Create Journal Voucher',
				route: '/create-journal-voucher'
			}
			,{
				name: 'Journal Vouchers',
				route: '/journal-voucher-list'
			},
			{
				name: 'Account List',
				route: '/account-list'
			},
			{
				name: 'Account Ledger',
				route: '/general-ledger'
			},
			{
				name: 'General Journal Ledger',
				route: '/general-journal-ledger'
			},
			{
				name: 'Chart Of Accounts',
				route: '/chart-of-accounts',
				sidebarName: 'Chart Of Accounts'
			}, {
				name: 'Trial Balance',
				route: '/trial-balance'
			}, {
				name: 'Profit Loss Statement',
				route: '/profit-loss-statement'
			},
			{
				name: 'Profit Loss Visa Report',
				route: '/profit-loss-visa-report'
			}
			,
			{
				name: 'Profit Loss Customer Report',
				route: '/profit-loss-customer-report'
			}
			, {
				name: 'Balance Sheet',
				route: '/balance-sheet'
			}

		],
	},
	{
		name: "User Management",
		sidebarName: "User Management",
		icon: "customer",

		route: '/user-list',
		userType: "A",
		childRoute: [],
		children: [


		],
	},

	{
		name: "Role Management",
		sidebarName: "Role Management",
		icon: "customer",

		route: '/role-list',
		userType: "A",
		childRoute: [],
		children: [


		],
	},

	{
		name: "Cost Management",
		sidebarName: "Settings",
		icon: "setting",

		userType: "A",
		childRoute: [{
			name: 'Cost Setup',
			route: '/cost-setup'
		}, {
			name: 'Rate Setup',
			route: '/rate-setup'
		}],
		children: [
			{
				name: 'Cost Management',
				route: '/cost-setup',
				sidebarName: 'Cost Setup'
			},
			{
				name: 'Rates Management',
				route: '/rate-setup',
				sidebarName: 'Rate Setup'
			}

		],
	},






];

export default Navigation;
