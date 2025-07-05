# Jewelry Website

## Description
This is a web development project created as part of the Web Technologies course. The website showcases a fictional jewelry store with features such as product listings, user interaction, and basic backend data handling.

## Technologies Used
- HTML – for the structure of the web pages
- CSS / SCSS – for styling and responsive layout
- JavaScript – for dynamic behavior and interactivity
- EJS – for templating and rendering dynamic HTML pages
- Node.js – for the server-side logic and routing
- pgAdmin – for database management

## Main Features
- **Product Search**: 
  - Can find products even if searched without diacritics (e.g., "bratara" matches "brățară")
  - Supports partial word matching (e.g., searching "aur" finds "brățară aurie")
- **Product Comparison**:
  - Allows users to select two products and compare them
  - Opens a separate page displaying side-by-side details for each item
- **Product Filtering**:
  - Users can filter products based on price, material, weight and other attributes
- **Responsive Design**: Works well on both desktop and mobile devices
- **Dynamic Templating**: Uses EJS to generate product pages dynamically
-- **Database connectivity** (via pgAdmin / PostgreSQL)
- **Product Sets with Discounts**:
  - Some products belong to curated sets
  - Sets have a special discounted price compared to buying items individually
