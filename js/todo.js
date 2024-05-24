//////////////////////////////
// todo.js - To Do is a simple, multi-user, task management app.
// Author - John Nolan
// Date - 5/20/24
//

//////////////////////////////
// OBJECT DECLARATIONS
//
// Task object
function Task (taskID, name, priority, dueDate) {
    this.taskID = taskID;           // Unique ID - used for index tracking in task array in User object
    this.name = name;           // Task Name
    this.priority = priority;   // Priority
    this.dueDate = dueDate;         // Due Date
}
// Task Getters and Setters
Task.prototype.getName = function() {
    return this.name;
}
Task.prototype.setName = function(name) {
    this.name = name;
}
Task.prototype.getPriority = function() {
    return this.priority;
}
Task.prototype.setPriority = function(priority) {
    this.priority = priority;
}
Task.prototype.getDueDate = function() {
    return this.dueDate;
}
Task.prototype.setDueDate = function(dueDate) {
    this.dueDate = dueDate;
}

// User object
function User(name) {
    this.name = name;           // Username
    this.tasks = new Array();   // Array of tasks
}
// User Getters and Setters
User.prototype.getName = function() {
    return this.name;
}
User.prototype.setName = function(name) {
    this.name = name;
}
User.prototype.addTask = function(name, priority, dueDate) {
    let taskIndex = this.tasks.length;  //  set taskID to the next available index
    let taskObject = new Task(taskIndex, name, priority, dueDate);
    this.tasks.push(taskObject);
    return taskObject;  // return the new Task object
}
User.prototype.removeTask = function(taskID) {
    // Find task in index and remove from array
    this.tasks.splice(taskID, 1);
    // this.tasks.filter(val => true); // re-index the array
}
User.prototype.updateTask = function(taskID, name, priority, dueDate) {
    // Find task ID in index and replace
    this.tasks[taskID].setName(name);
    this.tasks[taskID].setPriority(priority);
    this.tasks[taskID].setDueDate(dueDate);
}
User.prototype.getTasks = function () {
    return this.tasks;
}

//////////////////////////////
// Cookie Handling Functions
//
// Save cookie to the browser
function setCookie(cookieName, cookieValue, cookiePath, cookieExpires) {
    if (cookieExpires == "") {
        let nowDate = new Date();
        nowDate.setMonth(nowDate.getMonth() + 6);   // default to 6 month life
        cookieExpires = nowDate.toUTCString();
    }
    if (cookiePath != "") {
        cookiePath = ";Path=" + cookiePath;
    }
    document.cookie = cookieName + "=" + cookieValue + ";expires=" + cookieExpires + cookiePath;
}

// Get cookie from the browser
function getCookie(cookieName) {
    let cookieValue = document.cookie;
    let cookieStartsAt = cookieValue.indexOf(" " + cookieName + "=");
    if (cookieStartsAt == -1) {
        cookieStartsAt = cookieValue.indexOf(cookieName + "=");
    }
    if (cookieStartsAt == -1) {
        cookieValue = null;
    }
    else {
        cookieStartsAt = cookieValue.indexOf("=", cookieStartsAt) + 1;
        let cookieEndsAt = cookieValue.indexOf(";", cookieStartsAt);
        if (cookieEndsAt == -1) {
            cookieEndsAt = cookieValue.length;
        }
        cookieValue = cookieValue.substring(cookieStartsAt, cookieEndsAt);
    }
    return cookieValue;
}

// Delete cookie from the browser
function deleteCookie(cookieName) {
    document.cookie = cookieName + '=; expires=Thu, 01 Jan 1970 00:00:00 UTC;';
}

//////////////////////////////
// DATA STORAGE FUNCTIONS
//
// Pull all users data from storage
async function pullUsers() {
    const usersListString = getCookie("USERS");

    if (usersListString) {
        let users = JSON.parse(usersListString);

        // Add saved users data to the array
        for (let i = 0; i < users.length; i++) {
            // Create a User object with the name from userData
            let userObject = new User(users[i].name);

            // Load the tasks from userData into the new object
            for (let j = 0; j < users[i].tasks.length; j++) {
                let task = users[i].tasks[j];

                // Load the task data into a new Task object
                userObject.addTask(task.name, task.priority, task.dueDate);
            }
            USERS.push(userObject);
        }
    }
    else {
        // No saved users
    }
}

// Push all users data to storage
function pushUsers() {
    setCookie("USERS", JSON.stringify(USERS));
}

//////////////////////////////
// GLOBAL ELEMENTS
// 
const header = document.querySelector(".app_header");
const loginPanel = document.querySelector(".loginPanel");
const signUpPanel = document.querySelector(".signUpPanel");
const taskPanel = document.querySelector(".taskPanel");
const footer = document.querySelector(".app_footer");

//////////////////////////////
// LOGIN / SIGNUP 
//
// Switch between displaying the Login box and the Signup box
function toggleLoginSignup() {

    loginPanel.classList.toggle("hidden");
    if (loginPanel.classList.contains("hidden")) {
        footer.innerHTML = `<p>Sign up to track your daily tasks</p>`
    }
    signUpPanel.classList.toggle("hidden");
    if (signUpPanel.classList.contains("hidden")) {
        footer.innerHTML = `<p>Login to track your daily tasks</p>`;
    }
}

// Process user login
function submitLogin() {
    const loginNameTxt = document.getElementById("usernameLogin");
    
    // Check if usernameTxt is blank
    if (validateTextBox(loginNameTxt)) {
        let username= loginNameTxt.value;
        let userIndex = findUser(username);

        if (userIndex > -1) {   // load the user object from the USERS array
            let userObject = USERS[userIndex];
            loadUserSession(userObject);
            currentUserIndex = userIndex;   // Save index for modifying user later

            // Check the staySignedIn checkbox
            if (document.querySelector("#staySignedIn").checked) {
                // Build cookie
                const rememberUser = {
                    "user": currentUser.getName(),
                    "index": currentUserIndex
                };
                setCookie("REMEMBER", JSON.stringify(rememberUser)); // Push to storage
            }
        }
        else {
            let message = "User doesn't exist. Try signing up instead.";
            alert(message);
        }
    }
    else {
        return false;   // wait for input to validate
    }
}

// Process user sign up
function submitSignUp() {
    const signUpNameTxt = document.getElementById("usernameSignUp");

    // Check if usernameTxt is blank
    if (validateTextBox(signUpNameTxt)) {
        let username = signUpNameTxt.value;
        let userIndex = findUser(username);

        if (userIndex > -1) {
            let message = "Username already exists. Try logging in instead.";
            alert(message);
            return false;
        }
        else {  // create a new User object and add it to the USERS array
            let userObject = new User(username);
            USERS.push(userObject);
            currentUserIndex = USERS.length - 1;    // New user at the end of the array
            pushUsers();    // update the userlist
            loadUserSession(userObject); // start user session

            // Check the staySignedIn checkbox
            if (document.querySelector("#staySignedIn").checked) {
                // Build cookie
                const rememberUser = {
                    "user": currentUser.getName(),
                    "index": currentUserIndex
                };
                setCookie("REMEMBER", JSON.stringify(rememberUser)); // Push to storage
            }
            
            return false;
        }
    }
    else {
        return false;   // wait for input to validate
    }
}

// Find the username in the user array and return that User object
function findUser(username) {
    if (USERS.length > 0) {
        let userfound = USERS.findIndex(user => user.name.includes(username));
        return userfound;
    }
    else { 
        // USERS array is empty
        return -1;
    }   
}

// Set the user for this session
function loadUserSession(userObject) {
    // Assign user object object to the global session variable
    currentUser = userObject;

    // Hide the Login/SignUp panels
    if (!loginPanel.classList.contains("hidden")) {
        loginPanel.classList.toggle("hidden");
    }
    if (!signUpPanel.classList.contains("hidden")) {
        signUpPanel.classList.toggle("hidden");
    }

    // Unhide the Task panel
    taskPanel.classList.toggle("hidden");
    // Display User name
    const taskHeader = document.querySelector(".taskHeader");
    taskHeader.innerHTML = `${currentUser.getName()}'s Tasks`;
    // Display user's data on the screen
    let tasks = currentUser.getTasks()
    displayTasks(tasks);
    // Set focus to the Edit Input
    const editText = document.querySelector(".editText");
    editText.focus();
}

//////////////////////////////
// TASK FUNCTIONS ( Add, Edit, Remove, Display )
//
// Add a new task to the user's task list
function addNewTask() {
    const editText = document.querySelector(".editText");
    const editSelect = document.querySelector(".editSelect");
    const editDate = document.querySelector(".editDate");

    // Validate input box
    if (validateTextBox(editText)) {
        // Validate Date
        if (validateDateBox(editDate)) {
            // Fix the formatting from the input value
            let fixedDate = editDate.value;
            const re = /-/g;
            fixedDate = fixedDate.replace(re, "/");
 
            // Format the date string
            const dateObject = new Date(fixedDate);

            // Add the new Task object to the User object's tasks list
            let newTask = new Array();  // use an array to wrap the task so displayTasks can handle it
            newTask.push(currentUser.addTask(editText.value, editSelect.value, dateObject.toDateString()));

            // Add task to display
            displayTasks(newTask);
            
            // Push to storage
            pushUsers();

            // Clear the inputs
            editText.value = "";
            editText.focus();   // Return focus to the text input box
            editSelect.value = "Low";   // Reset default value on select
            editDate.value = "";
        }
    }
}

// EDIT TASK
async function taskEdit(event) {
    const taskRow = event.target.parentElement;
    const rowIndex = taskRow.rowIndex -1;   // Get Row index  (-1 for editTaskBar)
    const taskID = rowIndex - 1;            // Get Task index (-1 because table rows count from 1)

    // console.log(`Editing taskID:${taskID} @ rowIndex:${rowIndex}`);

    // Create references to Edit Task Elements
    const tableLabels = document.querySelector(".tableLabels");
    const taskList = document.querySelector(".taskTableBody");
    const editTaskBar = document.querySelector(".editTaskBar");
    const editText = document.querySelector(".editText");
    const editSelect = document.querySelector(".editSelect");
    const editDate = document.querySelector(".editDate");
    const editButton = document.querySelector(".editButton")

    // Modify the Edit Task Bar
    tableLabels.classList.add("editMode");
    editTaskBar.classList.add("editMode");
    editButton.removeEventListener("click", addNewTask); // waitForButton called further down 

    // Lock and dim the task list
    taskList.classList.add("shaded");
    // for each row disable buttons...
    // TODO

    // Wait for update button to press
    await waitForButton(editButton);    // tracks event listening for this button

    // Validate input box
    if (validateTextBox(editText)) {
        // Validate Date
        if (validateDateBox(editDate)) {
            // Fix the formatting from the input value
            let fixedDate = editDate.value;
            const re = /-/g;
            fixedDate = fixedDate.replace(re, "/");

            // Format the date string
            const dateObject = new Date(fixedDate);

            // Edit the user's Task object in the User's object @ taskID index
            const updatedTask = currentUser.updateTask(taskID, editText.value, editSelect.value, dateObject.toDateString());

            // Push user changes to USERS array
            USERS[currentUserIndex] = currentUser;

            // Push USERS list update to storage
            pushUsers();

            // Replace updated Task in same row
            const nameTXT = document.createTextNode(editText.value);
            const priorityTXT = document.createTextNode(editSelect.value);
            const dueTXT = document.createTextNode(dateObject.toDateString());
            const row = buildTaskRow(nameTXT, priorityTXT, dueTXT);

            // Replace updated Task in same row
            taskRow.innerHTML = row.innerHTML;

            // Return Edit Bar to normal
            tableLabels.classList.remove("editMode");
            editTaskBar.classList.remove("editMode");
            editButton.addEventListener("click", addNewTask);  // Add the original event listener back

            // Clear the inputs
            editText.value = "";
            editText.focus();   // Return focus to the text input box
            editSelect.value = "Low";   // Reset default value on select
            editDate.value = "";

            // Return the task list to normal
            taskList.classList.remove("shaded");
        }
    }
}

// Remove an existing task
function removeTask(event) {
    const taskRow = event.target.parentElement;
    const rowIndex = taskRow.rowIndex -1;   // Get the row index (-1 for the new task row)
    const taskID = rowIndex - 1;            // Get the task ID (-1 because the table count starts at 1 not 0)
    // console.log(`removing taskID ${taskID} @ row index ${rowIndex}...`);

    // Remove the element from the table
    taskRow.remove();
    
    // Remove the task from the User's tasks array
    currentUser.removeTask(taskID);

    // Push changes to USERS array
    USERS[currentUserIndex] = currentUser;

    // Push changes to storage
    pushUsers();

    // Re-render the table
    document.querySelector(".taskTableBody").innerHTML = "";
    displayTasks(currentUser.tasks);

    // Update the footer message
    footer.innerHTML = `<p>You currently have ${currentUser.tasks.length} tasks</p>`
}

// Display Full Task List
function displayTasks(taskList) {
    const tableBody = document.querySelector(".taskTableBody");
    // Render each task into the table
    for (let t = 0; t < taskList.length; t++) {

        const nameTXT = document.createTextNode(taskList[t].getName());
        const priorityTXT = document.createTextNode(taskList[t].getPriority());
        const dueTXT = document.createTextNode(taskList[t].getDueDate());

        const row = buildTaskRow(nameTXT, priorityTXT, dueTXT);

        // Append the rows to the table
        tableBody.appendChild(row);
    }

    // Update the footer message
    footer.innerHTML = `<p>You currently have ${currentUser.tasks.length} tasks</p>`
}

// Render a task into a row
function buildTaskRow(nameTXT, priorityTXT, dueTXT) {
    const row = document.createElement("tr");

    // console.log(`nameTXT=${nameTXT}, priorityTXT=${priorityTXT}, dueTXT=${dueTXT}`)

    // Task Name
    const nameTD = document.createElement("td");
    nameTD.appendChild(nameTXT);
    row.appendChild(nameTD);

    // Task Priority
    const priorityTD = document.createElement("td");
    priorityTD.appendChild(priorityTXT);
    row.appendChild(priorityTD);

    // Task Due Date
    const dueTD = document.createElement("td");
    dueTD.appendChild(dueTXT);
    row.appendChild(dueTD);

    // Add Update Button
    const updateButton = document.createElement("button");
    updateButton.id = "updateButton";
    updateButton.addEventListener("click", taskEdit); // Attach event handler
    updateButton.classList.add("updateButton", "icon");
    row.appendChild(updateButton);

    // Add Remove Button
    const removeButton = document.createElement("button");
    removeButton.id = "removeButton";
    removeButton.addEventListener("click", removeTask); // Attach event handler
    removeButton.classList.add("removeButton", "icon");
    row.appendChild(removeButton);

    return row;
}

// Function to wait for passed button to be clicked
//  - Must be called from async function
function waitForButton(buttonElement) {
    return new Promise (resolve => {
        const handler = () => {
            buttonElement.removeEventListener("click", handler);
            resolve();
        };
        buttonElement.addEventListener("click", handler);
    });
}

//////////////////////////////
// Validation Functions
//
// Validation check for all text inputs
function validateTextBox(textElement) {
    if (textElement.validity.valueMissing) {
        textElement.focus();
        textElement.reportValidity();
        return false;
    }
    else {
        return true;
    }
}

// Validation check for date input
function validateDateBox(dateElement) {
    const currentDate = new Date;                   // Get the current date
    currentDate.setDate(currentDate.getDate() - 1); // Take a day off so Today is a valid target
    const date = dateElement.value;

    if (date) { // Date exists
        // Fix input string format (Date is parsed differently when entered with dashes)
        let fixedDate = date;
        const re = /-/g;
        fixedDate = fixedDate.replace(re, "/"); // replace "-" with "/"
        let testDate = new Date(fixedDate);

        if (testDate < currentDate) { // Is date in the past? (compare timestamps)
            dateElement.focus();
            dateElement.setCustomValidity("Due Date must not be in the past");
            dateElement.reportValidity();
            return false;
        }
        else {  // Date is valid
            dateElement.setCustomValidity("");  // reset validity message
            dateElement.reportValidity();
            return true;
        }
    }
    else {    // date is missing!
        dateElement.focus();
        dateElement.setCustomValidity("Please fill out the Due Date");
        dateElement.reportValidity();
        return false;
    }
}

//////////////////////////////
// Initialize session data
//
// Declare Global USERS array
const USERS = new Array();
// Declare Global currentUser variable
let currentUser = null;
let currentUserIndex = null;
// Load the USERS array from storage
pullUsers();

//////////////////////////////
// Check if user session is remembered
//
// Check REMEMBER cookie
const rememberCookie = getCookie("REMEMBER");
if (rememberCookie) { 
    console.log("Remembering....")
    const rememberUser = JSON.parse(rememberCookie);
    currentUserIndex = rememberUser.index
    const userObject = USERS[currentUserIndex];
    loadUserSession(userObject);    // Load the remembered users session
}

//////////////////////////////
// Event Handlers
//
// Add Event Listener for Exit Button (Log Out)
const exitButton = document.querySelector(".exitButton");
exitButton.addEventListener("click", function(event) {
    // Clear REMEBER cookie
    deleteCookie("REMEMBER");
    console.log("cookie deleted???");
    // Reload page from server
    location.reload();
})

// Add Event Listeners for Login / SignUp Panels toggle
const toggleLS = document.querySelectorAll(".toggleLS");
for (let i = 0; i < toggleLS.length; i++) {
    toggleLS[i].addEventListener("click", toggleLoginSignup);
}

// Add Event Listener for loginButton
const loginButton = document.querySelector(".loginButton");
loginButton.addEventListener("click", submitLogin);

// Add Event Listener for signupButton
const signupButton = document.querySelector(".signupButton");
signupButton.addEventListener("click", submitSignUp);

// Add Event Listener for editButton - Add Task
const editButton = document.querySelector(".editButton");
editButton.addEventListener("click", addNewTask);

// Add Event Listener for Input elements
const editLogin = document.querySelector("#usernameLogin");
editLogin.addEventListener("keyup", function(event) {
    // If keyup check if it's the ENTER key
    if (event.keyCode == 13) {
        loginButton.click();
    }
});
const editSignUp = document.querySelector("#usernameSignUp");
editSignUp.addEventListener("keyup", function(event) {
    // If keyup check if it's the ENTER key
    if (event.keyCode == 13) {
        signupButton.click();
    }
});
const editText = document.querySelector(".editText");
editText.addEventListener("keyup", function(event) {
    // If keyup check if it's the ENTER key
    if (event.keyCode == 13) {
        editButton.click();
    }
});
const editSelect = document.querySelector(".editSelect");
editSelect.addEventListener("keyup", function(event) {
    // If keyup check if it's the ENTER key
    if (event.keyCode == 13) {
        editButton.click();
    }
});
const editDate = document.querySelector(".editDate");
editDate.addEventListener("keyup", function(event) {
    // If keyup check if it's the ENTER key
    if (event.keyCode == 13) {
        editButton.click();
    }
});