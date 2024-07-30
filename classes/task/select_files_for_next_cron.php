<?php
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

namespace tiny_cursive\task;

/**
 * Class select_files_for_next_cron
 *
 * @package    tiny_cursive
 * @copyright  CTI <info@cursivetechnology.com>
 * @license    http://www.gnu.org/copyleft/gpl.html GNU GPL v3 or later
 */

class select_files_for_next_cron extends \core\task\scheduled_task {
    /**
     * Return the task's name as shown in admin screens.
     *
     * @return string
     */
    public function get_name() {
        return get_string('pluginname', 'tiny_cursive');
    }

    /**
     * Execution function
     *
     * @return void
     * @throws \dml_exception
     */
    public function execute() {
        global $CFG, $DB;
       
        $batchlimit = get_config('tiny_cursive','batch_size');
        $sql = "SELECT * 
                  FROM {tiny_cursive_files} 
                       ORDER BY timemodified DESC 
                       LIMIT :batchlimit";
        $filerecords = $DB->get_records_sql($sql,['batchlimit' => $batchlimit]);

        foreach ($filerecords as $filerecord) {
            $filerecord->selected = 1;
            $DB->update_record('tiny_cursive_files', $filerecord);
        }
    }
}
