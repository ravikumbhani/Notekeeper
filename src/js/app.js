"use strict";

// Module import
import {
  addEventOnElements,
  getGreetingMsg,
  activeNotebook,
  makeElemEditable,
} from "./utils.js";
import { Tooltip } from "./components/Tooltip.js";
import { db } from "./db.js";
import { client } from "./client.js";
import { NoteModal } from "./components/Modal.js";

const /** {HTMLElement} */ $sidebar = document.querySelector("[data-sidebar]");
const /** {NodeList} */ $sidebarTogglers = document.querySelectorAll(
    "[data-sidebar-toggler]"
  );
const /** {HTMLElement} */ $overlay = document.querySelector(
    "[data-sidebar-overlay]"
  );

addEventOnElements($sidebarTogglers, "click", function () {
  $sidebar.classList.toggle("active");
  $overlay.classList.toggle("active");
});

// Initialize tooltip behavior for all DOM elements with 'data-tooltip' attribute
const /** {NodeList} */ $tooltipElements =
    document.querySelectorAll("[data-tooltip]");
$tooltipElements.forEach(($elem) => Tooltip($elem));

// Show greeting message on homepage
const /** {HTMLElement} */ $greetElement =
    document.querySelector("[data-greeting]");
const currentHour = new Date().getHours();

$greetElement.textContent = getGreetingMsg(currentHour);

// Show current date on homepage
const /** {HTMLElement} */ $currentDateElement = document.querySelector(
    "[data-current-date]"
  );

$currentDateElement.textContent = new Date().toDateString().replace(" ", ", ");

// Notebook create field
const /** {HTMLElement} */ $sidebarList = document.querySelector(
    "[data-sidebar-list]"
  );
const /** {HTMLElement} */ $addNotebookBtn = document.querySelector(
    "[data-add-notebook]"
  );

/**
 * Shows a notebook creation field in the sidebar when the "Add Notebook" 
button is clicked.
 * The function dynamically adds a new notebook field element, makes it editable, and listens for the 'Enter' key to create a new notebook when pressed.
 */

const showNotebookField = () => {
  const /** {HTMLDivElement} */ $navItem = document.createElement("div");
  $navItem.classList.add("nav-item");

  $navItem.innerHTML = `
    <span class="text text-label-large" data-notebook-field></span>
    <div class="state-layer"></div>`;

  $sidebarList.appendChild($navItem);

  const /** {HTMLElement} */ $navItemField = $navItem.querySelector(
      "[data-notebook-field]"
    );

  // Active new created notebook and desactive the last one.
  activeNotebook.call($navItem);

  // Make notebook field content editable and focus
  makeElemEditable($navItemField);

  // When user press 'Enter' then create notebook
  $navItemField.addEventListener("keydown", createNotebook);
};

$addNotebookBtn.addEventListener("click", showNotebookField);

/**
 * Create new notebook
 * Creates a new notebook when the 'Enter' key is pressed while editing a notebook name field.
 * The new notebook is stored in the database.
 * @param {KeyboardEvent} event - The keyboard event that triggered notebook creation.
 */
const createNotebook = function (event) {
  if (event.key === "Enter") {
    // Store new created notebook in database
    const /** {Object} */ notebookData = db.post.notebook(
        this.textContent || "Untitled"
      ); // this: $navItemField
    this.parentElement.remove();

    // Render navItem
    client.notebook.create(notebookData);
  }
};

/**
 * Renders the existing notebook list by retrieving data from the database and passing it to the client.
 */
const renderExitedNotebook = function () {
  const /** {Array} */ notebookList = db.get.notebook();
  client.notebook.read(notebookList);
};

renderExitedNotebook();

/**
 * Create new note
 * Attaches event listeners to a collection of DOM elements representing "Create Note" buttons.
 * When a button is clicked, it opens a modal for creating a new note and handles the submission
 * of the new note to the database and client.
 */

const /** {NodeList} */ $noteCreateBtns = document.querySelectorAll(
    "[data-note-create-btn]"
  );

addEventOnElements($noteCreateBtns, "click", function () {
  // Create and open a new modal
  const /** */ modal = NoteModal();
  modal.open();

  // Handle the submission of the new note to the database and client
  modal.onSubmit((noteObj) => {
    const /** string */ activeNotebookId = document.querySelector(
        "[data-notebook].active"
      )?.dataset.notebook;

    const /** {Object} */ noteData = db.post.note(activeNotebookId, noteObj);
    client.note.create(noteData);
    modal.close();
  });
});

/**
 * Renders existing notes in the active notebook. Retrieves note data from the database based on the active notebook's ID
 * and uses the client to display the notes.
 */

const renderExistedNote = function () {
  const /** {string | undefined} */ activeNotebookId = document.querySelector(
      "[data-notebook].active"
    )?.dataset.notebook;

  if (activeNotebookId) {
    const /** {Array<Object>} */ noteList = db.get.note(activeNotebookId);

    // Display existing notes
    client.note.read(noteList);
  }
};

renderExistedNote();

document.querySelector(".current-yr-cp").textContent = new Date().getFullYear();
