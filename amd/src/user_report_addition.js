// This file is part of Moodle - http://moodle.org/
//
// Moodle is free software: you can redistribute it and/or modify
// it under the terms of the GNU General Public License as published by
// the Free Software Foundation, either version 3 of the License, or
// (at your option) any later version.
//
// Moodle is distributed in the hope that it will be useful,
// but WITHOUT ANY WARRANTY; without even the implied warranty of
// MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
// GNU General Public License for more details.
//
// You should have received a copy of the GNU General Public License
// along with Moodle.  If not, see <http://www.gnu.org/licenses/>.

/**
 * TODO describe module user_report_addition
 *
 * @module     tiny_cursive/user_report_addition
 * @copyright  2024 CTI <your@email.com>
 * @license    http://www.gnu.org/copyleft/gpl.html GNU GPL v3 or later
 */

export const init = () => {
    const courseNameElement = document.querySelector('#id_courseid option[selected]');

    if (!courseNameElement) {
        window.history.back();
    }
    const forumTestingText = courseNameElement.textContent.trim();
    const h5Element = document.createElement('div');

    h5Element.classList.add('row', 'align-items-center', 'pb-4');
    const label = document.createElement('label');

    label.textContent = 'Course Name';
    label.classList.add('col-md-3', 'col-form-label', 'd-flex', 'pb-0', 'pr-md-0');
    h5Element.appendChild(label);

    const label2 = document.createElement('label');
    label2.textContent = forumTestingText;
    label2.classList.add('col-md-9', 'col-form-label', 'd-flex', 'pb-0', 'pr-md-0');
    h5Element.appendChild(label2);

    const moduleIdElement = document.getElementById('fitem_id_moduleid');
    const parentElement = moduleIdElement.parentElement;
    parentElement.insertBefore(h5Element, moduleIdElement);
    document.getElementById('fitem_id_courseid').style.display = 'none';
};