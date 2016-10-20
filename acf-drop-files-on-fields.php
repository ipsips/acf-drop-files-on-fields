<?php
/*
Plugin Name: Advanced Custom Fields: Drop Files on Fields
Plugin URI:  https://developer.wordpress.org/plugins/acf-drop-files-on-fields/
Description: Makes it possible to drop files directly on ACF fields that accept files (types: Image, Gallery and File).
Version:     1.0.0
Author:      ips.re
Author URI:  http://ips.re/
License:     Apache License 2.0
License URI: https://www.apache.org/licenses/LICENSE-2.0.txt
Text Domain: acf-drop-files-on-fields
Domain Path: /languages
*/

if (!defined('ABSPATH'))
  exit;

require_once 'acf-drop-files-on-fields-settings.php';

class ACF_Drop_Files_On_Fields {
  function __construct() {
    $this->options = get_option(
      'acf_drop_files_on_fields_options',
      ACF_Drop_Files_On_Fields_Settings::get_default_options()
    );

    /**
     * @todo
     */
    load_plugin_textdomain('acf-drop-files-on-fields', false, plugin_basename(dirname(__FILE__)).'/languages' ); 

    add_action('admin_enqueue_scripts', [$this, 'include_scripts_and_styles']);
  }

  function include_scripts_and_styles() {
    $min = defined('SCRIPT_DEBUG') && SCRIPT_DEBUG ? '' : '.min';
    $dir_url = plugin_dir_url(__FILE__);

    wp_enqueue_style('acf-drop-files-on-fields-style', "{$dir_url}styles/acf-drop-files-on-fields{$min}.css");
    wp_enqueue_script('acf-drop-files-on-fields', "{$dir_url}scripts/acf-drop-files-on-fields{$min}.js", ['jquery', 'acf-input']);

    if (get_current_screen()->base == 'post')
      wp_localize_script('acf-drop-files-on-fields', 'acfDropFilesOnFields', [
        'enabledTypes' => $this->get_active_types(),
        'disableEditorAsDropTarget' =>
          array_key_exists('disabled_for', $this->options) &&
          array_key_exists('content_editor', $this->options['disabled_for'])
            ? $this->options['disabled_for']['content_editor']
            : false
      ]);
  }

  function get_active_types() {
    if (!count($this->options['enabled_for']))
      return [];

    $registered_field_types = self::get_field_types();

    return array_filter($this->options['enabled_for'], function ($enabled_type) use ($registered_field_types) {
      return array_key_exists($enabled_type, $registered_field_types);
    });
  }

  public static function get_field_types() {
    return apply_filters('acf_drop_files_on_fields/field_types', [
      'gallery' => 'Gallery',
      'image' => 'Image',
      'file' => 'File'
    ]);
  }
}
new ACF_Drop_Files_On_Fields();