"use strict";

import { Tooltip } from "./Tooltip.js";
import { activeNotebook, makeElemEditable } from "../utils.js";
import { db } from "../db.js";
import { client } from "../client.js";
import { DeleteConfirmModel } from "./Modal.js";

const /** {HTMLElement} */ $notePanelTitle = document.querySelector(
    "[data-note-panel-title]"
  );

/**
* Creates a navigation item representing a notebook. This item
displays the notebook's name, allows editing
* and deletion of the notebook, and handles click events to display
its associated notes.
*
* @param {string} id - The unique identifier of the notebook.
* @param {string} name - The name of the notebook.
* @returns {HTMLElement} - An HTML element representing the navigation item for the notebook.
*/

export const NavItem = function (id, name) {
  const /** {HTMLDivElement} */ $navItem = document.createElement("div");
  $navItem.classList.add("nav-item");
  $navItem.setAttribute("data-notebook", id);

  $navItem.innerHTML = `
    <span class="text text-label-large" data-notebook-field>${name}</span>
    <button
      class="icon-btn small"
      data-tooltip="Edit notebook"
      aria-label="Edit notebook"
      data-edit-btn
    >
      <span class="material-symbols-rounded" aria-hidden="true">edit</span>
      <div class="state-layer"></div>
    </button>
    <button
      class="icon-btn small"
      data-tooltip="Delete notebook"
      aria-label="Delete notebook"
      data-delete-btn
    >
      <span class="material-symbols-rounded" aria-hidden="true">delete</span>
      <div class="state-layer"></div>
    </button>
    <div class="state-layer"></div>
  `;

  // Show tooltip on edit and delete button
  const /** {NodeList>} */ $tooltipElements =
      $navItem.querySelectorAll("[data-tooltip]");
  $tooltipElements.forEach(($element) => Tooltip($element));

  /**
   * Handles the click event on the navigation item. Updates the note panel's title, retrieves the associated notes,
   * and marks the item as active.
   */
  $navItem.addEventListener("click", function () {
    $notePanelTitle.textContent = name;
    activeNotebook.call(this);

    const /** {Array<Object>} */ noteList = db.get.note(this.dataset.notebook);

    client.note.read(noteList);
  });

  /**
   * Notebook edit functionality
   */
  const /** {HTMLElement} */ $navItemEditBtn =
      $navItem.querySelector("[data-edit-btn]");
  const /** {HTMLElement} */ $navItemField = $navItem.querySelector(
      "[data-notebook-field]"
    );

  $navItemEditBtn.addEventListener(
    "click",
    makeElemEditable.bind(null, $navItemField)
  );

  $navItemField.addEventListener("keydown", function (event) {
    if (event.key === "Enter") {
      this.removeAttribute("contenteditable");

      // Update edited data in database
      const updateNotebookData = db.update.notebook(id, this.textContent);

      // Render updated notebook
      client.notebook.update(id, updateNotebookData);
    }
  });

  /**
   * Notebook delete functionality
   */
  const /** {HTMLElement} */ $navItemDeleteBtn =
      $navItem.querySelector("[data-delete-btn]");

  $navItemDeleteBtn.addEventListener("click", function () {
    const /** {Object} */ modal = DeleteConfirmModel(name);

    modal.open();

    modal.onSubmit(function (isConfirm) {
      if (isConfirm) {
        db.delete.notebook(id);
        client.notebook.delete(id);
      }

      modal.close();
    });
  });

  return $navItem;
};
