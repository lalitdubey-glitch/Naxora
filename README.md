
# 🛍️ Naxora - E-Commerce Platform

[![Live Demo](https://img.shields.io/badge/Live_Demo-Visit_Naxora-2ea44f?style=for-the-badge&logo=googlechrome&logoColor=white)](https://naxora.runasp.net/)





A full-stack, responsive e-commerce web application built using **ASP.NET Core MVC** and **MS SQL Server**, featuring an integrated admin management workflow, real-time catalog filtering, dynamic cart management, and server-side image optimization.

---

## 📌 Table of Contents

* [Tech Stack](https://www.google.com/search?q=%23-tech-stack)
* [Overview](https://www.google.com/search?q=%23-overview)
* [Key Features](https://www.google.com/search?q=%23-key-features)
* [System Architecture](https://www.google.com/search?q=%23-system-architecture)
* [Project Structure](https://www.google.com/search?q=%23-project-structure)
* [Local Setup](https://www.google.com/search?q=%23-local-setup)
* [Author](https://www.google.com/search?q=%23-author)

---

## 💻 Tech Stack

* **Backend:** C#, ASP.NET Core MVC, ADO.NET
* **Frontend:** Razor Pages (`.cshtml`), HTML5, CSS3, JavaScript, jQuery
* **Database:** MS SQL Server (Stored Procedures, Parameterized Queries)
* **Asset Processing:** Server-Side Image Manipulation & Resizing
* **Deployment:** MonsterASP.net / Custom ASP.NET Hosting

---

## 📖 Overview

**Naxora** is an end-to-end e-commerce solution engineered to deliver an intuitive online shopping experience. It features modular client-side scripting alongside a structured .NET backend that handles complex category hierarchies, customer identity/profile management, and an administrative inventory control center.

---

## ✨ Key Features

### 🛒 Shopper Experience

* **Dynamic Catalog:** Browse and filter products across nested categories and subcategories in real time.
* **Cart & Order Flow:** Interactive cart operations powered by modular client-side handlers (`products.js`).
* **User Accounts:** Registration, login, profile updates, and secure account binding via `SignUpModel`.

### 🛡️ Admin Management

* **Central Dashboard:** Admin control panel (`AdminController`, `Index.cshtml`) for managing inventory, listings, and stock.
* **Hierarchical Taxonomies:** Manage parent categories and subcategories with dedicated AJAX workflows (`Category.js`, `SubCategory.js`).
* **Asset Processing:** Automated server-side image resizing and compression prior to disk storage to maintain minimal payloads.

### ⚡ Data & Backend Performance

* **Optimized Data Layer:** Direct ADO.NET abstraction (`DbLayer.cs`) utilizing parameterized queries and stored procedures.
* **Relational Persistence:** Normalized schema design backed by **MS SQL Server**.

---

## 🏗️ System Architecture

```text
+-----------------------------------------------------------------------------------+
|                                     NAXORA                                        |
+-----------------------------------------------------------------------------------+
|                                                                                   |
|    [Shopper]                                                  [Administrator]     |
|        │                                                             │            |
|        ├──► Browses Catalog / Cart                                   ├──► Manages |
|        │    (products.js, Catalog Views)                             │    Catalog |
|        │                                                             │    (Admin) |
|        ▼                                                             ▼            |
|  [HomeController]                                            [AdminController]    |
|        │                                                             │            |
|        ├───────────────┬─────────────────────────────┬───────────────┤            |
|                        ▼                             ▼                            |
|                 [Models & DTOs]             [Image Processing]                    |
|             (ProductModel, SignUpModel)    (Resizing & Storage)                   |
|                        │                             │                            |
|                        └──────────────┬──────────────┘                            |
|                                       ▼                                           |
|                              [DbLayer (ADO.NET)]                                  |
|                                       │                                           |
|                                       ▼                                           |
|                                [MS SQL Server]                                    |
+-----------------------------------------------------------------------------------+

```

---

## 📂 Project Structure

```text
naxora/
├── Controllers/
│   ├── HomeController.cs        # Catalog browsing, cart, and authentication endpoints
│   └── AdminController.cs       # Administrative actions and inventory workflows
├── Models/
│   ├── ProductModel.cs          # Product entities and catalog validations
│   └── SignUpModel.cs           # User credentials and account structures
├── Data/
│   └── DbLayer.cs               # SQL Server connection management and query execution
├── Views/
│   ├── Home/                    # Storefront catalog and account pages
│   └── Admin/
│       └── Index.cshtml         # Unified admin management portal
└── wwwroot/
    ├── js/
    │   ├── products.js          # Cart state and storefront dynamic UI
    │   ├── admin.js             # Dashboard handlers
    │   ├── Category.js          # Category AJAX bindings
    │   └── SubCategory.js       # Subcategory AJAX bindings
    └── uploads/                 # Processed product image storage

```

---

## 🚀 Local Setup

1. **Clone the repository:**
```bash
git clone [https://github.com/lalitdubey-glitch/Naxora.git](https://github.com/lalitdubey-glitch/Naxora.git)
cd Naxora

```


2. **Configure Connection String:**
Update database credentials in `appsettings.json`:
```json
{
  "ConnectionStrings": {
    "DefaultConnection": "Server=YOUR_SERVER_NAME;Database=NaxoraDb;Trusted_Connection=True;MultipleActiveResultSets=true;TrustServerCertificate=True;"
  }
}

```


3. **Database Initialization:**
Execute database schema scripts and stored procedures in SSMS.
4. **Build and Run:**
```bash
dotnet restore
dotnet build
dotnet run

```


Local app starts at `https://localhost:5001`.

---

## 👤 Author

**Lalit Kumar Dubey**

* GitHub: [@lalitdubey-glitch](https://github.com/lalitdubey-glitch?utm_source=gemini)
* Portfolio: [lalitdubeyportfolio.netlify.app](https://www.google.com/search?q=https://lalitdubeyportfolio.netlify.app&utm_source=gemini)

```

```
