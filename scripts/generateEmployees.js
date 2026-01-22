// Generate 55 mock employees with realistic data
const firstNames = ['James', 'Mary', 'John', 'Patricia', 'Robert', 'Jennifer', 'Michael', 'Linda', 'William', 'Elizabeth', 'David', 'Barbara', 'Richard', 'Susan', 'Joseph', 'Jessica', 'Thomas', 'Sarah', 'Charles', 'Karen', 'Christopher', 'Nancy', 'Daniel', 'Lisa', 'Matthew', 'Betty', 'Anthony', 'Margaret', 'Mark', 'Sandra', 'Donald', 'Ashley', 'Steven', 'Kimberly', 'Paul', 'Emily', 'Andrew', 'Donna', 'Joshua', 'Michelle', 'Kenneth', 'Dorothy', 'Kevin', 'Carol', 'Brian', 'Amanda', 'George', 'Melissa', 'Edward', 'Deborah', 'Ronald', 'Stephanie', 'Timothy', 'Rebecca', 'Jason'];
const lastNames = ['Smith', 'Johnson', 'Williams', 'Brown', 'Jones', 'Garcia', 'Miller', 'Davis', 'Rodriguez', 'Martinez', 'Hernandez', 'Lopez', 'Gonzalez', 'Wilson', 'Anderson', 'Thomas', 'Taylor', 'Moore', 'Jackson', 'Martin', 'Lee', 'Perez', 'Thompson', 'White', 'Harris', 'Sanchez', 'Clark', 'Ramirez', 'Lewis', 'Robinson', 'Walker', 'Young', 'Allen', 'King', 'Wright', 'Scott', 'Torres', 'Nguyen', 'Hill', 'Flores', 'Green', 'Adams', 'Nelson', 'Baker', 'Hall', 'Rivera', 'Campbell', 'Mitchell', 'Carter', 'Roberts', 'Chen', 'Kim', 'Patel', 'Shah', 'Kumar'];
const departments = ['Engineering', 'Sales', 'Marketing', 'HR', 'Finance', 'Product', 'Customer Support', 'Operations'];
const teams = ['Core', 'Platform', 'Growth', 'Enterprise', 'SMB', 'Infrastructure'];
const titles = ['Software Engineer', 'Senior Software Engineer', 'Staff Engineer', 'Engineering Manager', 'Product Manager', 'Senior Product Manager', 'Sales Representative', 'Account Executive', 'Marketing Specialist', 'HR Generalist', 'Financial Analyst', 'Customer Support Specialist', 'Operations Manager', 'Data Analyst', 'Designer', 'Senior Designer'];
const locations = ['San Francisco', 'New York', 'Austin', 'Seattle', 'London', 'Remote'];
const workAuth = ['Citizen', 'Permanent Resident', 'H1B', 'L1', 'F1-OPT'];
const countries = ['United States', 'Canada', 'United Kingdom', 'Germany', 'India'];

function randomItem(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

function generatePhone() {
  return `+1-${Math.floor(Math.random() * 900) + 100}-${Math.floor(Math.random() * 900) + 100}-${Math.floor(Math.random() * 9000) + 1000}`;
}

function generateDate(startYear, endYear) {
  const year = Math.floor(Math.random() * (endYear - startYear + 1)) + startYear;
  const month = Math.floor(Math.random() * 12) + 1;
  const day = Math.floor(Math.random() * 28) + 1;
  return `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
}

const employees = [];

// Create some managers first (indices 0-9)
for (let i = 0; i < 55; i++) {
  const firstName = firstNames[i % firstNames.length];
  const lastName = lastNames[i % lastNames.length];
  const department = departments[i % departments.length];
  const isManager = i < 10;
  
  const emp = {
    id: `EMP${String(i + 1).padStart(4, '0')}`,
    // Employment Information
    title: isManager ? `${department} Manager` : randomItem(titles),
    department: department,
    team: randomItem(teams),
    compensation: Math.floor(Math.random() * 150000) + 60000,
    compensationPer: 'Year',
    targetBonus: Math.floor(Math.random() * 30000),
    equity: Math.floor(Math.random() * 5000),
    workEmail: `${firstName.toLowerCase()}.${lastName.toLowerCase()}@rippling.com`,
    manager: i < 10 ? null : `EMP${String((i % 10) + 1).padStart(4, '0')}`,
    managerName: i < 10 ? null : `${firstNames[(i % 10) % firstNames.length]} ${lastNames[(i % 10) % lastNames.length]}`,
    workLocation: randomItem(locations),
    
    // Personal Information
    legalFirstName: firstName,
    legalLastName: lastName,
    preferredName: Math.random() > 0.7 ? randomItem(firstNames) : firstName,
    dateOfBirth: generateDate(1965, 2000),
    homeAddressLine1: `${Math.floor(Math.random() * 9999) + 1} ${randomItem(['Main', 'Oak', 'Maple', 'Cedar', 'Pine', 'Elm'])} ${randomItem(['St', 'Ave', 'Blvd', 'Dr', 'Ln'])}`,
    homeAddressLine2: Math.random() > 0.7 ? `Apt ${Math.floor(Math.random() * 500) + 1}` : '',
    homeCity: randomItem(['San Francisco', 'New York', 'Austin', 'Seattle', 'Denver', 'Chicago', 'Boston', 'Los Angeles']),
    homeState: randomItem(['CA', 'NY', 'TX', 'WA', 'CO', 'IL', 'MA']),
    homeZip: String(Math.floor(Math.random() * 90000) + 10000),
    homeCountry: 'United States',
    personalEmail: `${firstName.toLowerCase()}.${lastName.toLowerCase()}@gmail.com`,
    personalPhone: generatePhone(),
    
    // Additional Information
    emergencyContactName: `${randomItem(firstNames)} ${lastName}`,
    emergencyContactRelationship: randomItem(['Spouse', 'Parent', 'Sibling', 'Friend']),
    emergencyContactPhone: generatePhone(),
    employeeId: `EMP${String(i + 1).padStart(4, '0')}`,
    nationalId: `***-**-${String(Math.floor(Math.random() * 9000) + 1000)}`,
    workAuthorization: randomItem(workAuth),
    citizenship: randomItem(countries),
    
    // Integrated Apps
    slackStatus: 'Active',
    slackEmail: `${firstName.toLowerCase()}.${lastName.toLowerCase()}@rippling.com`,
    googleWorkspaceStatus: 'Active',
    googleWorkspaceEmail: `${firstName.toLowerCase()}.${lastName.toLowerCase()}@rippling.com`,
    githubStatus: department === 'Engineering' ? 'Active' : 'Pending',
    githubUsername: department === 'Engineering' ? `${firstName.toLowerCase()}${lastName.toLowerCase()}` : '',
    
    // Two Factor
    twoFactorMethod: randomItem(['Authenticator App', 'SMS', 'Hardware Key']),
    twoFactorDeviceLabel: randomItem(['iPhone', 'Android', 'YubiKey', 'Google Authenticator']),
    twoFactorStatus: 'Active',
    
    // Direct Reports (computed)
    directReports: [],
    
    // Documents (mock)
    documents: [
      { name: 'Offer Letter', type: 'Employment', status: 'Signed', date: generateDate(2020, 2024) },
      { name: 'W-4', type: 'Tax', status: 'Signed', date: generateDate(2020, 2024) },
      { name: 'I-9', type: 'Compliance', status: 'Signed', date: generateDate(2020, 2024) }
    ],
    
    // Metadata for edge cases
    status: 'Active',
    hireDate: generateDate(2018, 2024)
  };
  
  employees.push(emp);
}

// Add edge case employees
// EMP0047 - Circular manager (will reference self)
employees[46].manager = 'EMP0047';
employees[46].managerName = `${employees[46].legalFirstName} ${employees[46].legalLastName}`;
employees[46]._edgeCase = 'circular_manager';

// EMP0048 - Invalid email format
employees[47].workEmail = 'invalid-email-format';
employees[47]._edgeCase = 'invalid_email';

// EMP0049 - Compensation outside salary band
employees[48].compensation = 500000;
employees[48]._edgeCase = 'salary_out_of_band';

// EMP0050 - Pending termination
employees[49].status = 'Pending Termination';
employees[49]._edgeCase = 'pending_termination';

// EMP0051 - Blocked field (for permission demo)
employees[50]._edgeCase = 'blocked_field';

// EMP0052 - TPA sync conflict
employees[51]._edgeCase = 'tpa_conflict';
employees[51].slackStatus = 'Sync Error';

// EMP0053 - Benefits eligibility trigger
employees[52]._edgeCase = 'benefits_trigger';
employees[52].compensation = 149999; // Just under eligibility threshold

// EMP0054 - Recently changed (concurrent edit demo)
employees[53]._edgeCase = 'concurrent_edit';
employees[53]._lastModified = new Date().toISOString();

// EMP0055 - On Leave
employees[54].status = 'On Leave';
employees[54]._edgeCase = 'on_leave';

// Compute direct reports
employees.forEach(emp => {
  if (emp.manager) {
    const managerIdx = employees.findIndex(e => e.id === emp.manager);
    if (managerIdx >= 0) {
      employees[managerIdx].directReports.push({
        id: emp.id,
        name: `${emp.legalFirstName} ${emp.legalLastName}`,
        title: emp.title,
        department: emp.department
      });
    }
  }
});

console.log(JSON.stringify(employees, null, 2));
