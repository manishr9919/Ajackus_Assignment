const API_URL = "https://jsonplaceholder.typicode.com/users";

let users = [];
let currentPage = 1;
let limit = 10;
let sortField = null;
let sortDirection = "asc";
let editingUserId = null;

const userTableBody = document.getElementById("userTableBody");
const paginationLimit = document.getElementById("paginationLimit");
const prevPageBtn = document.getElementById("prevPage");
const nextPageBtn = document.getElementById("nextPage");
const searchInput = document.getElementById("searchInput");

const modal = document.getElementById("userModal");
const modalTitle = document.getElementById("modalTitle");
const userForm = document.getElementById("userForm");
const closeModalBtn = document.getElementById("closeModal");

// Fetch Users
async function fetchUsers() {
  try {
    const res = await fetch(API_URL);
    const data = await res.json();
    users = data.map((u) => ({
      id: u.id,
      firstName: u.name.split(" ")[0],
      lastName: u.name.split(" ")[1] || "",
      email: u.email,
      department: u.company?.name || "N/A",
    }));
    renderTable();
  } catch (error) {
    alert("Error fetching users!");
  }
}

function renderTable() {
  let filtered = [...users];

  // Search
  const searchTerm = searchInput.value.toLowerCase();
  if (searchTerm) {
    filtered = filtered.filter(
      (u) =>
        u.firstName.toLowerCase().includes(searchTerm) ||
        u.lastName.toLowerCase().includes(searchTerm) ||
        u.email.toLowerCase().includes(searchTerm) ||
        u.department.toLowerCase().includes(searchTerm)
    );
  }

  // Sort
  if (sortField) {
    filtered.sort((a, b) => {
      if (a[sortField] < b[sortField]) return sortDirection === "asc" ? -1 : 1;
      if (a[sortField] > b[sortField]) return sortDirection === "asc" ? 1 : -1;
      return 0;
    });
  }

  // Pagination
  const start = (currentPage - 1) * limit;
  const paginated = filtered.slice(start, start + limit);

  // Render rows
  userTableBody.innerHTML = "";
  paginated.forEach((u) => {
    const row = `
      <tr class="border-b">
        <td class="p-3">${u.id}</td>
        <td class="p-3">${u.firstName}</td>
        <td class="p-3">${u.lastName}</td>
        <td class="p-3">${u.email}</td>
        <td class="p-3">${u.department}</td>
        <td class="p-3">
          <button onclick="editUser(${u.id})" class="text-blue-500">Edit</button>
          <button onclick="deleteUser(${u.id})" class="text-red-500 ml-2">Delete</button>
        </td>
      </tr>
    `;
    userTableBody.innerHTML += row;
  });
}

function openModal(isEdit = false, user = null) {
  modal.classList.remove("hidden");
  modal.classList.add("flex");
  if (isEdit) {
    modalTitle.textContent = "Edit User";
    editingUserId = user.id;
    document.getElementById("firstName").value = user.firstName;
    document.getElementById("lastName").value = user.lastName;
    document.getElementById("email").value = user.email;
    document.getElementById("department").value = user.department;
  } else {
    modalTitle.textContent = "Add User";
    editingUserId = null;
    userForm.reset();
  }
}

function closeModal() {
  modal.classList.add("hidden");
}

function editUser(id) {
  const user = users.find((u) => u.id === id);
  openModal(true, user);
}

function deleteUser(id) {
  if (confirm("Are you sure you want to delete this user?")) {
    users = users.filter((u) => u.id !== id);
    renderTable();
  }
}

userForm.addEventListener("submit", (e) => {
  e.preventDefault();
  const newUser = {
    id: editingUserId || users.length + 1,
    firstName: document.getElementById("firstName").value,
    lastName: document.getElementById("lastName").value,
    email: document.getElementById("email").value,
    department: document.getElementById("department").value,
  };

  if (editingUserId) {
    users = users.map((u) => (u.id === editingUserId ? newUser : u));
  } else {
    users.push(newUser);
  }

  closeModal();
  renderTable();
});

document.getElementById("addUserBtn").addEventListener("click", () => openModal());
closeModalBtn.addEventListener("click", closeModal);

paginationLimit.addEventListener("change", (e) => {
  limit = parseInt(e.target.value);
  currentPage = 1;
  renderTable();
});
prevPageBtn.addEventListener("click", () => {
  if (currentPage > 1) {
    currentPage--;
    renderTable();
  }
});
nextPageBtn.addEventListener("click", () => {
  currentPage++;
  renderTable();
});

document.querySelectorAll("th[data-sort]").forEach((th) => {
  th.addEventListener("click", () => {
    const field = th.getAttribute("data-sort");
    if (sortField === field) {
      sortDirection = sortDirection === "asc" ? "desc" : "asc";
    } else {
      sortField = field;
      sortDirection = "asc";
    }
    renderTable();
  });
});

searchInput.addEventListener("input", renderTable);

fetchUsers();
