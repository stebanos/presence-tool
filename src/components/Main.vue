<template>
  <div v-if="presence">
    <div class="banner">
      <h1 class="banner-header">{{ presence.title }}</h1>
    </div>
    <div v-if="tab === 'builder'" class="presence-builder">
      <div>
        <h2 class="presence-header">Builder</h2>
        <builder :presence-statuses="orderedPresenceStatuses" :status-defaults="fixedStatusDefaults" @move-up="onMoveUp" @move-down="onMoveDown" @create="onCreate" @remove="onRemove"></builder>
      </div>
      <div>
        <h2 class="presence-header">Preview Entry 'Presence 1'</h2>
        <preview-entry :presence-statuses="orderedPresenceStatuses" :preview-students="preview_students" :options="preview_options"></preview-entry>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { Component, Prop, Vue } from 'vue-property-decorator';
import { PresenceStatus, ExtraStatus, Presence } from '../types';
import APIConfig from '../connect/APIConfig';
import Connector from '../connect/Connector';
import Builder from './Builder.vue';
import PreviewEntry from './PreviewEntry.vue';

@Component({
  components: { Builder, PreviewEntry }
})
export default class Main extends Vue {
  // eslint-disable-next-line
  pdata: any = {};
  connector: Connector|null = null;
  presence: Presence|null = null;
  tab = 'builder';
  
  readonly preview_options = {
    display_selected: 'color-code'
  };
  
  readonly preview_students = [
    { name: 'Student 1', selected: 3 }, 
    { name: 'Student 2', selected: 3 }, 
    { name: 'Student 3', selected: 3 }, 
  ];

  @Prop({type: APIConfig, required: true}) readonly apiConfig!: APIConfig;

  async load() : Promise<void> {
    if (!this.connector) { return; }
    
    this.pdata = {
      students: await this.connector.loadStudents(),
      status_defaults: await this.connector.loadStatusDefaults(),
      presences: await this.connector.loadPresences()
    };
    
    if (this.pdata.presences.length) {
      this.presence = this.pdata.presences[0];
    }
  }
  
  get fixedStatusDefaults() : PresenceStatus[] {
    if (!this.pdata.status_defaults) { return []; }
    return this.pdata.status_defaults.filter((s : PresenceStatus) => !s.aliasses);
  }
  
  get presenceStatuses() : PresenceStatus[] {
    if (!this.presence || !this.presence.metadata) { return []; }

    const statuses : PresenceStatus[] = [].concat(this.pdata.status_defaults);
    const extraStatuses : ExtraStatus[] = this.presence.metadata.statuses;
    extraStatuses.forEach(status => {
      if (status['ref-id']) {
        const s = statuses.find(s => s.id === status['ref-id']);
        if (s && status['color']) {
          s.color = status['color'];
        }
        if (s && status['code']) {
          s.code = status['code'];
        }
      } else {
        statuses.push(status as unknown as PresenceStatus);
      }
    });
    return statuses;
  }
  
  get orderedPresenceStatuses() : PresenceStatus[] {
    if (!this.presence || !this.presence.metadata) { return []; }

    const presenceStatuses = this.presenceStatuses;
    return this.presence.metadata.order
      .map(i => presenceStatuses.find(s => s.id === i))
      .filter((status) : status is PresenceStatus => typeof status !== undefined);
  }
  
  onMoveUp(index: number) : void {
    if (!this.presence || !this.presence.metadata) { return; }
    if (index <= 0) { return; }

    const order = this.presence.metadata.order;
    this.presence.metadata.order = order.slice(0, index - 1).concat(order[index], order[index - 1]).concat(order.slice(index + 1));
  }
  
  onMoveDown(index: number) : void {
    if (!this.presence || !this.presence.metadata) { return; }

    const order = this.presence.metadata.order;
    if (index >= order.length - 1) { return; }
    this.presence.metadata.order = order.slice(0, index).concat(order[index + 1], order[index]).concat(order.slice(index + 2));
  }
  
  onCreate(status: ExtraStatus) {
    if (!this.presence || !this.presence.metadata) { return; }

    const newId = this.presence.metadata.latest + 1;
    this.presence.metadata.statuses.push({ id: newId, ...status });
    this.presence.metadata.order.push(newId);
    this.presence.metadata.latest = newId;
  }
  
  onRemove(status: ExtraStatus) {
    if (!this.presence || !this.presence.metadata) { return; }
    
    const statuses = this.presence.metadata.statuses;
    const order = this.presence.metadata.order;

    let index = statuses.findIndex(o => o === status);
    if (index === -1) { return; }
    this.presence.metadata.statuses = statuses.slice(0, index).concat(statuses.slice(index + 1));

    index = order.findIndex(o => o === status.id);
    if (index === -1) { return; }
    this.presence.metadata.order = order.slice(0, index).concat(order.slice(index + 1));
  }

  mounted() : void {
    this.connector = new Connector(this.apiConfig);
    this.load();
  }
}
</script>

<style>
.u-flex {
  display: flex;
}

.u-gap-small {
  gap: 5px;
}

.u-flex-wrap {
  flex-flow: wrap;
}

.u-txt-truncate {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.btn.mod-presence-new {
  margin-top: 10px;
}

.btn.mod-presence-new .fa {
  font-size: 13px;
  margin-right: 5px;
}

.btn.mod-presence {
  color: #4d88b3;
  font-size: 14px;
  padding: 2px 5px;
  width: 25px;
}

.btn.mod-presence.mod-cancel .fa {
  color: red;
}

.form-control.mod-input {
  height: initial;
  padding: 2px 5px;
}

.form-control.mod-input.mod-small {
  width: 50px;
}

.form-control.mod-select {
  height: initial;
  padding: 3px 5px;
  width: initial;
}

.banner {
  background-color: #2b6597;
  border-bottom: 1px solid #14578f;
  padding: 20px 15px;
}

.banner-header {
  color: #fff;
  font-size: 2.2rem;
  margin: 0;
}

.presence-header {
  color: #507177;
  font-size: 1.6rem;
  margin: 0 0 25px 8px;
}

.presence-header + div {
  margin-right: 20px;
}

.presence-builder {
  align-items: baseline;
  display: flex;
  flex-flow: wrap;
  gap: 40px 70px;
  margin: 25px 20px 20px;
}

.presence-swatches {
  display: grid;
  grid-gap: 2px;
  grid-template-columns: repeat(10, 1fr);
  padding: 2px;
}

.color, .color-code {
  background-color: var(--color);
  border: 1px solid transparent;
  border-radius: 3px;
  color: var(--text-color);
}

.color[disabled] {
  cursor: not-allowed;
  opacity: .4;
}

.color {
  height: 16px;
  width: 40px;
}

.color.mod-swatch {
  width: 20px;
  z-index: 1000;
}

.table.mod-presence .color {
  transition: opacity 200ms linear, background 75ms linear;
}

.color-code {
  transition: background 75ms linear, color 75ms linear;
}

.color.is-selected, .table.mod-presence .color:hover,
.color-code.is-selected, .table-period .color-code:hover {
  box-shadow: 1px 1px 2px -1px #673ab7;
}

.color.mod-swatch.is-selected {
  position: relative;  
}

.color.mod-swatch.is-selected:after {
  content: '\f00c';
  font-family: 'FontAwesome';
  font-size: 11px;
  left: calc(50% - .5em);
  position: absolute;
  text-align: center;
  top: 0;
}

.color-code {
  display: flex;
  font-size: 14px;
  font-variant: all-small-caps;
  font-weight: 900;
  height: 20px;
  line-height: 12px;
  min-width: 40px;
  padding: 2px 4px;
  justify-content: center;
}

.color-code.is-selected {
  position: relative;
}

.color-code.is-selected:after {
  background-color: inherit;
  border: 1px solid rgba(255, 255, 255, .92);
  border-radius: 50%;
  bottom: -4px;
  content: '\f00c';
  font-family: 'FontAwesome';
  font-size: 11px;
  font-weight: 400;
  line-height: 8px;
  position: absolute;
  right: -4px;
  z-index: 10;
}

.table.mod-presence {
  border-top-color: #ebebeb;
}

.table.mod-presence thead th {
  background-color: #f8fbfb;
  color: #727879;
}

@-moz-document url-prefix() {
  .table.mod-presence thead th {
    background-clip: padding-box;
  }
}

.table.mod-presence th, .table.mod-presence td {
  border: 1px solid #ebebeb;
  vertical-align: middle;
}

.table.mod-presence tbody {
  transition: opacity 200ms linear;
}

.table.mod-presence tbody tr:first-child {
  background: linear-gradient(to bottom, #e3eaed 0, transparent 4px);
}

@media not all and (min-resolution: .001dpcm) { 
  @media {
    .table.mod-presence tbody tr:first-child {
      background: -webkit-linear-gradient(#e3eaed 0px, rgba(255,255,255,0) 4px);
    }
  }
}

.table.mod-builder {
  margin-bottom: 0;
  width: fit-content;
}

.table.mod-builder .form-control {
  transition: background 200ms linear;
}

.table.mod-builder.is-changes-disabled tbody {
  opacity: .8;
}

.table.mod-builder tfoot th {
  font-weight: 400;
}

.table.mod-builder {
  position: relative;
}

.table.mod-builder thead {
  position: relative;
}

.table.mod-builder .table-actions {
  background: #fff;
  padding: 0;
  position: absolute;
}

.table.mod-builder thead .table-actions {
  border: 0;
  bottom: -1px;
  top: -1px;
  width: 1px;
}

.table.mod-builder tbody .table-actions {
  border-color: #fff;
  bottom: 0;
  top: 0;
}

.table.mod-builder td {
  padding: 0;
}

.table.mod-builder .cell-pad {
  padding: 8px;
}

@media only screen and (min-width: 460px) {
  .table.mod-builder tbody .actions-wrap {
    align-items: center;
    height: 100%;
    justify-content: center;
    margin-left: 8px;
  }
  .table.mod-builder tbody .actions-wrap-2 {
    flex-direction: column;
  }
}

@media only screen and (max-width: 459px) {
  .table.mod-builder .actions-wrap-2 {
    position: absolute;
    right: 0;
    bottom: -35px;
  }
}

@media (pointer:fine) {
  .table.mod-builder tbody tr:hover {
    background: #f4fbfb;
  }

  .table.mod-builder tbody tr:first-child:hover {
    background: linear-gradient(to bottom, #e3eaed 0, #f4fbfb 4px);
  }

  .table.mod-builder tbody tr:hover td:not(.table-actions) {
    border-color: #e3e3e3;
  }
}

@-moz-document url-prefix() {
  .table.mod-builder tbody tr.is-selected:hover {
    background: unset;
  }

  .table.mod-builder tbody tr:hover td:not(.table-actions) {
    background: #f4fbfb;
    background-clip: padding-box;
  }

  .table.mod-builder tbody tr:first-child:hover td:not(.table-actions) {
    background: linear-gradient(to bottom, #e3eaed 0, #f4fbfb 4px);
  }
}

.table.mod-builder tbody tr.is-selected {
  background: #ecf4f4;
}

.table.mod-builder tbody tr.is-selected:first-child {
  background: linear-gradient(to bottom, #e3eaed 0, #ecf4f4 4px);
}

.table.mod-builder tbody tr.is-selected td:not(.table-actions) {
  border-color: #e3e3e3;
}

@-moz-document url-prefix() {
  .table.mod-builder tr.is-selected {
    background: unset;
  }

  .table.mod-builder tbody tr.is-selected td:not(.table-actions) {
    background: #ecf4f4;
    background-clip: padding-box;
  }

  .table.mod-builder tbody tr:first-child.is-selected td:not(.table-actions) {
    background: linear-gradient(to bottom, #e3eaed 0, #ecf4f4 4px);
  }
}

.table.mod-builder tr.is-selected .table-actions {
  z-index: 100;
}

.table.mod-builder tr.is-selected .btn.mod-presence:last-child:not(:disabled) {
  color: red;
}

.table.mod-builder tbody tr:not(.is-selected) .btn.mod-presence {
  pointer-events: none;
  opacity: 0;
  box-shadow: none;
}

.table.mod-builder tfoot {
  position: relative;
}

.table.mod-builder tfoot .table-actions {
  bottom: 0;
  top: 0;
  width: 1px;
}

.table.mod-builder tfoot .actions-wrap {
  align-items: flex-end;
  background: #fff;
  border: 1px solid #fff;
  border-left: 0;
  bottom: -1px;
  display: flex;
  left: -1px;
  position: absolute;
  top: -2px;
  width: 70px;
}

.table.mod-builder tfoot .actions-wrap-2 {
  display: flex;
  gap: 5px;
  justify-content: center;
  margin-bottom: 8px;
  width: 100%;
}

@media only screen and (max-width: 580px) {
  .table.mod-builder tfoot .actions-wrap-2 {
    position: absolute;
    bottom: -35px;
    left: -62px;
  }
}

.radio-tabs-default {
  background-color: rgba(255, 255, 255, .45);
  border-radius: 3px;
  box-shadow: 0 1px 2px rgba(0, 0, 0, .05);
  color: #337ab7;
}
.radio-tabs-default:hover, .radio-tabs-default:focus {
  background-color: #fff;
  box-shadow: 0 1px 2px hsla(208, 55%, 25%, .10);
  color: #507177;
}
.radio-tabs {
  cursor: pointer;
  font-weight: normal;
  margin: 0;
  padding: 0 .5em;
}
.radio-tabs-active, .radio-tabs-active:hover, .radio-tabs-active:focus  {
  background-color: #fff;
  box-shadow: 0 1px 2px hsla(208, 55%, 25%, .40);
  color: #507177;
}

.table.mod-entry th.table-result {
  max-width: 1px;
}

.table.mod-entry .table-period {
  border-right: 0;
}

.table.mod-entry .table-result {
  border-left: 0;
}

.table-period {
  position: relative;
}

.table-result .result-wrap {
  margin: 0 auto;
  max-width: fit-content;
}

.table-period:after {
  background-color: #ebebeb;
  bottom: 8px;
  content: '';
  display: block;
  position: absolute;
  right: -1px;
  top: 8px;
  width: 1px;
}
</style>

<style>
:root {
  --text-color-dark: #333;
  --text-color-light: #fff;
}

/*  Material Design colors
 *  Credits:
 *
 *  Original color palette by
 *  https://www.google.com/design/spec/style/color.html
 */

.pink-100 { --color: #f8bbd0; --text-color: var(--text-color-dark); }
.pink-300 { --color: #f06292; --text-color: var(--text-color-light); }
.pink-500 { --color: #e91e63; --text-color: var(--text-color-light); }
.pink-700 { --color: #c2185b; --text-color: var(--text-color-light); }
.pink-900 { --color: #880e4f; --text-color: var(--text-color-light); }

.blue-100 { --color: #bbdefb; --text-color: var(--text-color-dark); }
.blue-300 { --color: #64b5f6; --text-color: var(--text-color-light); }
.blue-500 { --color: #2196f3; --text-color: var(--text-color-light); }
.blue-700 { --color: #1976d2; --text-color: var(--text-color-light); }
.blue-900 { --color: #0d47a1; --text-color: var(--text-color-light); }

.cyan-100 { --color: #b2ebf2; --text-color: var(--text-color-dark); }
.cyan-300 { --color: #4dd0e1; --text-color: var(--text-color-light); }
.cyan-500 { --color: #00bcd4; --text-color: var(--text-color-light); }
.cyan-700 { --color: #0097a7; --text-color: var(--text-color-light); }
.cyan-900 { --color: #006064; --text-color: var(--text-color-light); }

.teal-100 { --color: #b2dfdb; --text-color: var(--text-color-light); }
.teal-300 { --color: #4db6ac; --text-color: var(--text-color-light); }
.teal-500 { --color: #009688; --text-color: var(--text-color-light); }
.teal-700 { --color: #00796b; --text-color: var(--text-color-light); }
.teal-900 { --color: #004d40; --text-color: var(--text-color-light); }

.green-100 { --color: #c8e6c9; --text-color: var(--text-color-dark); }
.green-300 { --color: #81c784; --text-color: var(--text-color-light); }
.green-500 { --color: #4caf50; --text-color: var(--text-color-light); }
.green-700 { --color: #388e3c; --text-color: var(--text-color-light); }
.green-900 { --color: #1b5e20; --text-color: var(--text-color-light); }

.light-green-100 { --color: #dcedc8; --text-color: var(--text-color-dark); }
.light-green-300 { --color: #aed581; --text-color: var(--text-color-light); }
.light-green-500 { --color: #8bc34a; --text-color: var(--text-color-light); }
.light-green-700 { --color: #689f38; --text-color: var(--text-color-light); }
.light-green-900 { --color: #33691e; --text-color: var(--text-color-light); }

.lime-100 { --color: #f0f4c3; --text-color: var(--text-color-dark); }
.lime-300 { --color: #dce775; --text-color: var(--text-color-dark); }
.lime-500 { --color: #cddc39; --text-color: var(--text-color-dark); }
.lime-700 { --color: #afb42b; --text-color: var(--text-color-light); }
.lime-900 { --color: #827717; --text-color: var(--text-color-light); }

.yellow-100 { --color: #fff9c4; --text-color: var(--text-color-dark); }
.yellow-300 { --color: #fff176; --text-color: var(--text-color-dark); }
.yellow-500 { --color: #ffeb3b; --text-color: var(--text-color-dark); }
.yellow-700 { --color: #fbc02d; --text-color: var(--text-color-dark); }
.yellow-900 { --color: #f57f17; --text-color: var(--text-color-light); }

.amber-100 { --color: #ffecb3; --text-color: var(--text-color-dark); }
.amber-300 { --color: #ffd54f; --text-color: var(--text-color-dark); }
.amber-500 { --color: #ffc107; --text-color: var(--text-color-dark); }
.amber-700 { --color: #ffa000; --text-color: var(--text-color-light); }
.amber-900 { --color: #ff6f00; --text-color: var(--text-color-light); }

.deep-orange-100 { --color: #ffccbc; --text-color: var(--text-color-dark); }
.deep-orange-300 { --color: #ff8a65; --text-color: var(--text-color-light); }
.deep-orange-500 { --color: #ff5722; --text-color: var(--text-color-light); }
.deep-orange-700 { --color: #e64a19; --text-color: var(--text-color-light); }
.deep-orange-900 { --color: #bf360c; --text-color: var(--text-color-light); }
</style>

<style>
.popover {
    top: 0;
    left: 0;
    z-index: 1060;
    max-width: 276px;
    font-family: -apple-system,BlinkMacSystemFont,Segoe UI,Roboto,Helvetica Neue,Arial,Noto Sans,sans-serif,Apple Color Emoji,Segoe UI Emoji,Segoe UI Symbol,Noto Color Emoji;
    font-style: normal;
    font-weight: 400;
    line-height: 1.5;
    text-align: left;
    text-decoration: none;
    text-shadow: none;
    text-transform: none;
    letter-spacing: normal;
    word-break: normal;
    word-spacing: normal;
    white-space: normal;
    line-break: auto;
    font-size: .875rem;
    word-wrap: break-word;
    background-color: #fff;
    background-clip: padding-box;
    border: 1px solid rgba(0,0,0,.2);
    border-radius: .3rem;
}
.popover, .popover .arrow {
    position: absolute;
    display: block;
}
.bs-popover-auto[x-placement^=right], .bs-popover-right {
    margin-left: .5rem;
}
.popover.b-popover {
    display: block;
    opacity: 1;
    outline: 0;
}
.popover .arrow {
    width: 1rem;
    height: .5rem;
    margin: 0 .3rem;
}
.bs-popover-auto[x-placement^=right]>.arrow, .bs-popover-right>.arrow {
    left: calc(-.5rem - 1px);
    width: .5rem;
    height: 1rem;
    margin: .3rem 0;
}
.bs-popover-auto[x-placement^=left], .bs-popover-left {
    margin-right: .5rem;
}
.bs-popover-auto[x-placement^=bottom], .bs-popover-bottom {
    margin-top: .5rem;
}
.bs-popover-auto[x-placement^=top], .bs-popover-top {
    margin-bottom: .5rem;
}
.popover .arrow:after, .popover .arrow:before {
    position: absolute;
    display: block;
    content: "";
    border-color: transparent;
    border-style: solid;
}
.bs-popover-auto[x-placement^=right]>.arrow:before, .bs-popover-right>.arrow:before {
    left: 0;
    border-width: .5rem .5rem .5rem 0;
    border-right-color: rgba(0,0,0,.25);
}
.bs-popover-auto[x-placement^=right]>.arrow:after, .bs-popover-right>.arrow:after {
    left: 1px;
    border-width: .5rem .5rem .5rem 0;
    border-right-color: #fff;
}
.bs-popover-auto[x-placement^=bottom]>.arrow:before, .bs-popover-bottom>.arrow:before {
    top: 0;
    border-width: 0 .5rem .5rem;
    border-bottom-color: rgba(0,0,0,.25);
}
.bs-popover-auto[x-placement^=bottom]>.arrow:after, .bs-popover-bottom>.arrow:after {
    top: 1px;
    border-width: 0 .5rem .5rem;
    border-bottom-color: #fff;
}
.bs-popover-auto[x-placement^=top]>.arrow:before, .bs-popover-top>.arrow:before {
    bottom: 0;
    border-width: .5rem .5rem 0;
    border-top-color: rgba(0,0,0,.25);
}
.bs-popover-auto[x-placement^=top]>.arrow:after, .bs-popover-top>.arrow:after {
    bottom: 1px;
    border-width: .5rem .5rem 0;
    border-top-color: #fff;
}
.bs-popover-auto[x-placement^=left]>.arrow:before, .bs-popover-left>.arrow:before {
    right: 0;
    border-width: .5rem 0 .5rem .5rem;
    border-left-color: rgba(0,0,0,.25);
}
.bs-popover-auto[x-placement^=left]>.arrow:after, .bs-popover-left>.arrow:after {
    right: 1px;
    border-width: .5rem 0 .5rem .5rem;
    border-left-color: #fff;
}
</style>