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
 * @module     tiny_cursive/autosaver
 * @category TinyMCE Editor
 * @copyright  CTI <info@cursivetechnology.com>
 * @author kuldeep singh <mca.kuldeep.sekhon@gmail.com>
 */

import { call } from 'core/ajax';
import { create } from 'core/modal_factory';
import { get_string as getString } from 'core/str';
import { save, cancel, hidden } from 'core/modal_events';
import jQuery from 'jquery';

export const register = (editor, interval, userId) => {

    var isStudent = !(jQuery('#body').hasClass('teacher_admin'));
    var intervention = jQuery('#body').hasClass('intervention');
    var userid = userId;
    var host = M.cfg.wwwroot;
    var courseid = M.cfg.courseId;
    var filename = "";
    var quizSubmit = jQuery('#mod_quiz-next-nav');
    var ed = "";
    var event = "";
    var resourceId = 0;
    var modulename = "";
    var editorid = editor?.id;
    var cmid = M.cfg.contextInstanceId;
    var questionid = 0;
    let assignSubmit = jQuery('#id_submitbutton');
    var syncInterval = interval ? interval * 1000 : 10000; // Default: Sync Every 10s.
    var lastCaretPos = 1;
    // var skipKeys = ["Shift", "Ctrl", "Alt", "ArrowDown", "ArrowUp", "Control", "ArrowRight",
    //     "ArrowLeft", "Meta", "CapsLock", "Escape", "Delete", "PageUp", "PageDown",
    //     "Insert", "Home", "End", "NumLock"];

    const postOne = async (methodname, args) => {
        try {
            const response = await call([{
                methodname,
                args,
            }])[0];
            return response;
        } catch (error) {
            window.console.error('Error in postOne:', error);
            throw error;
        }
    };

    assignSubmit.on('click', async function (e) {
        e.preventDefault();
        sessionStorage.removeItem(`${userid}_${resourceId}_${cmid}_position`);
        if (filename) {
            // eslint-disable-next-line
            syncData().then(() => {
                assignSubmit.off('click').click();
            });
        } else {
            assignSubmit.off('click').click();
        }
    });

    quizSubmit.on('click', async function (e) {
        e.preventDefault();
        sessionStorage.removeItem(`${userid}_${resourceId}_${cmid}_position`);
        if (filename) {
            // eslint-disable-next-line
            syncData().then(() => {
                quizSubmit.off('click').click();
            });
        } else {
            quizSubmit.off('click').click();
        }
    });

    const getModal = (e) => {

        Promise.all([
            getString('tiny_cursive_srcurl', 'tiny_cursive'),
            getString('tiny_cursive_srcurl_des', 'tiny_cursive'),
            getString('tiny_cursive_placeholder', 'tiny_cursive')
        ]).then(function ([title, titledes, placeholder]) {

            return create({
                type: 'SAVE_CANCEL',
                title: `<div><div style='color:dark;font-weight:500;line-height:0.5'>${title}</div><span style='color: gray;font-weight: 400;line-height: 1.2;font-size: 14px;display: inline-block;margin-top: .5rem;'>${titledes}</span></div>`,
                body: `<textarea  class="form-control inputUrl" value="" id="inputUrl" placeholder="${placeholder}"></textarea>`,

                removeOnClose: true,
            })
                .done(modal => {
                    modal.getRoot().append('<style>.close{ display: none ! important; }</style>');
                    modal.show();
                    var lastEvent = '';
                    // eslint-disable-next-line
                    modal.getRoot().on(save, function () {
                        var number = document.getElementById("inputUrl").value;
                        if (number === "" || number === null || number === undefined) {
                            editor.execCommand('Undo');
                            // eslint-disable-next-line
                            alert("You cannot paste text without providing source");
                        } else {
                            editor.execCommand('Paste');
                        }
                        let ur = e.srcElement.baseURI;
                        let resourceId = 0;
                        let parm = new URL(ur);
                        let modulename = "";
                        let editorid = editor?.id;
                        let courseid = M.cfg.courseId;
                        let cmid = M.cfg.contextInstanceId;

                        // eslint-disable-next-line
                        if (ur.includes("attempt.php") || ur.includes("forum") || ur.includes("assign")) { } else {
                            return false;
                        }
                        if (ur.includes("forum") && !ur.includes("assign")) {
                            resourceId = parm.searchParams.get('edit');
                        }
                        if (!ur.includes("forum") && !ur.includes("assign")) {
                            resourceId = parm.searchParams.get('attempt');
                        }

                        if (resourceId === null) {
                            resourceId = 0;
                        }
                        if (ur.includes("forum")) {
                            modulename = "forum";
                        }
                        if (ur.includes("assign")) {
                            modulename = "assign";
                            resourceId = cmid;
                        }
                        if (ur.includes("attempt")) {
                            modulename = "quiz";
                        }
                        if (cmid === null) {
                            cmid = 0;
                        }

                        postOne('cursive_user_comments', {
                            modulename: modulename,
                            cmid: cmid,
                            resourceid: resourceId,
                            courseid: courseid,
                            usercomment: number,
                            timemodified: Date.now(),
                            editorid: editorid ? editorid : ""
                        });
                        lastEvent = 'save';
                        modal.destroy();
                    });
                    modal.getRoot().on(cancel, function () {

                        editor.execCommand('Undo');
                        lastEvent = 'cancel';
                    });
                    modal.getRoot().on(hidden, function () {
                        if (lastEvent != 'cancel' && lastEvent != 'save') {
                            editor.execCommand('Undo');
                        }
                    });
                    return modal;
                });
        });

    };
    // eslint-disable-next-line
    const sendKeyEvent = (events, eds) => {
        let ur = eds.srcElement.baseURI;
        let parm = new URL(ur);
        ed = eds;
        event = events;
        // eslint-disable-next-line
        if (ur.includes("attempt.php") || ur.includes("forum") || ur.includes("assign") || ur.includes("lesson")) { } else {
            return false;
        }
        // eslint-disable-next-line
        if (ur.includes("forum") && !ur.includes("assign")) {
            resourceId = parm.searchParams.get('edit');
        } else {

            resourceId = parm.searchParams.get('attempt');
        }
        if (resourceId === null) {
            resourceId = 0;
        }

        if (ur.includes("forum")) {
            modulename = "forum";
        }
        if (ur.includes("assign")) {
            modulename = "assign";
            resourceId = cmid;
        }
        if (ur.includes("attempt")) {
            modulename = "quiz";
        }
        if(ur.includes("lesson")){
            modulename = "lesson";
        }

        filename = `${userid}_${resourceId}_${cmid}_${modulename}_attempt`;

        if (modulename === 'quiz') {
            questionid = editorid.split(':')[1].split('_')[0];
            filename = `${userid}_${resourceId}_${cmid}_${questionid}_${modulename}_attempt`;

        }

        if (localStorage.getItem(filename)) {

            let data = JSON.parse(localStorage.getItem(filename));
            data.push({
                resourceId: resourceId,
                key: ed.key,
                keyCode: ed.keyCode,
                event: event,
                courseId: courseid,
                unixTimestamp: Date.now(),
                clientId: host,
                personId: userid,
                position: ed.caretPosition,
                rePosition: ed.rePosition
            });
            localStorage.setItem(filename, JSON.stringify(data));
        } else {
            let data = [];
            data.push({
                resourceId: resourceId,
                key: ed.key,
                keyCode: ed.keyCode,
                event: event,
                courseId: courseid,
                unixTimestamp: Date.now(),
                clientId: host,
                personId: userid,
                position: ed.caretPosition,
                rePosition: ed.rePosition
            });
            localStorage.setItem(filename, JSON.stringify(data));
        }

    };
    editor.on('keyUp', (editor) => {
        let position = getCaretPosition(true);
        editor.caretPosition = position.caretPosition;
        editor.rePosition = position.rePosition;
        sendKeyEvent("keyUp", editor);
    });
    editor.on('Paste', async (e) => {
        if (isStudent && intervention) {
            getModal(e);
        }
    });
    editor.on('Redo', async (e) => {
        if (isStudent && intervention) {
            getModal(e);
        }
    });
    editor.on('keyDown', (editor) => {
        let position = getCaretPosition();
        editor.caretPosition = position.caretPosition;
        editor.rePosition = position.rePosition;
        sendKeyEvent("keyDown", editor);


    });
    editor.on('mouseDown', async (editor) => {
        constructMouseEvent(editor);
        sendKeyEvent("mouseDown", editor);
    });
    editor.on('mouseUp', async (editor) => {
        constructMouseEvent(editor);
        sendKeyEvent("mouseUp", editor);
    });

    // eslint-disable-next-line
    editor.on('init', () => {
        // editor.on('KeyUp MouseUp click NodeChange SetContent', function(e) {
        //     try {
        //         const currentPos = getCaretPosition();
        //         lastCaretPos = currentPos;
        //     } catch (error) {
        //         console.warn('Error updating caret position:', error);
        //     }
        // });
    });

    function constructMouseEvent(editor) {
        let position = getCaretPosition();
        editor.caretPosition = position.caretPosition;
        editor.rePosition = position.rePosition;
        editor.key = getMouseButton(editor);
        editor.keyCode = editor.button;

    }
    function getMouseButton(editor) {

        switch (editor.button) {
            case 0:
                return 'left';
            case 1:
                return 'middle';
            case 2:
                return 'right';
        }
    }

    function getCaretPosition(skip = false) {
        try {
            if (!editor || !editor.selection) {
                return 0;
            }

            const rng = editor.selection.getRng();

            if (skip) {
                return {
                    caretPosition: lastCaretPos,
                    rePosition: rng.startOffset + 1
                };
            }

            const storageKey = `${userid}_${resourceId}_${cmid}_position`;

            let storedPos = parseInt(sessionStorage.getItem(storageKey), 10);
            if (isNaN(storedPos)) {
                storedPos = 0;
            }

            storedPos++;
            lastCaretPos = storedPos;


            sessionStorage.setItem(storageKey, storedPos);

            return {
                caretPosition: storedPos,
                rePosition: rng.startOffset + 1
            };

            // let node = rng.startContainer;


            // Calculate position by walking through previous nodes
            // while (node && node !== editor.getBody()) {
            //     while (node.previousSibling) {
            //         node = node.previousSibling;
            //         if (node.textContent) {
            //             position += node.textContent.length;
            //         }
            //     }
            //     node = node.parentNode;
            // }

        } catch (e) {
            console.warn('Error getting caret position:', e);
            return 0;
        }
    }

    /**
     * Synchronizes data from localStorage to server
     * @async
     * @function SyncData
     * @description Retrieves stored keypress data from localStorage and sends it to server
     * @returns {Promise} Returns response from server if data exists and is successfully sent
     * @throws {Error} Logs error to console if data submission fails
     */
    async function syncData() {

        let data = localStorage.getItem(filename);

        if (!data || data.length === 0) {
            return;
        } else {
            localStorage.removeItem(filename);
            let originalText = editor.getContent({ format: 'text' });
            try {
                // eslint-disable-next-line
                return await postOne('cursive_write_local_to_json', {
                    key: ed.key,
                    event: event,
                    keyCode: ed.keyCode,
                    resourceId: resourceId,
                    cmid: cmid,
                    modulename: modulename,
                    editorid: editorid,
                    "json_data": data,
                    originalText: originalText
                });
            } catch (error) {
                window.console.error('Error submitting data:', error);
            }
        }
    }

    window.addEventListener('unload', () => {
        syncData();
        sessionStorage.setItem(`${userid}_${resourceId}_${cmid}_position`, lastCaretPos);
    });

    setInterval(syncData, syncInterval);
};
