<template>
    <div class="autocomplete-container" :class="containerClasses" :id="containerId">
        <slot name="label-top"></slot>
        <input :class="fieldClasses"
                v-focus.lazy="inputFocused"
                :placeholder="placeholder"
                :id="fieldId"
                :name="fieldName"
                v-model="terms"
                :cursor="caretPos"
                @input="search()"
                @focus="search()"
                @keydown.left="search()"
                @keydown.right="search()"
                @keyup.enter="enter()"
                @keydown.down = "down()"
                @keydown.up = "up()"
                @keydown.esc="emptyResultsList()"
                @blur="inputFocused = false">
        <slot name="label-bottom"></slot>
        <ul class="dawa-autocomplete-suggestions" :class="listClasses" v-if="results && results.length > 0" :id="containerId + '_' + 'results'">
            <li class="dawa-autocomplete-suggestion" :class="computedListItemClasses(index)"
                v-for="(result, index) of results"
                :key="index"
                :ref="'result_' + index"
                @click.prevent="select(result)"
                @enter.prevent="select(result)">
                {{result.tekst}}
            </li>
        </ul>
    </div>
</template>
<script>
  'use strict'
  import {getInputSelection} from './utils'
  import { DawaService } from './dawa.service'
  import {mixin} from './focus.directive'
  export default {
    name: 'vue-dawa',
    mixins: [
      mixin
    ],
    props: {
      // optional placeholder
      placeholder: {
        required: false,
        type: String
      },
      // better targetting
      containerId: {
        required: true,
        type: String
      },
      containerClasses: {
        type: [String, Object]
      },
      // for improved accessibility when used with label
      fieldId: {
        required: true,
        type: String
      },
      fieldClasses: {
        type: [String, Object]
      },
      // for use with form validation
      fieldName: {
        type: String
      },
      listClasses: {
        type: [String, Object]
      },
      listItemClasses: {
        type: [String, Object]
      },
      // describe the field (optional)
      label: {
        required: false,
        type: String
      },
      // determines the initial value of the field
      val: {
        required: false,
        type: String
      },
      addressId: {
        required: false,
        type: String
      },
      options: {
        type: Object,
        required: false,
        default: () => {
          return {}
        }
      },
      showMax: {
        type: Number,
        required: false
      }
    },
    data () {
      return {
        results: [],
        selectedResult: null,
        terms: this.val || '',
        defaultCaretPos: 2,
        caretPos: 2,
        oldCaretPos: null,
        dawaService: null,
        inputFocused: false,
        currentIndex: 0,
        initActions: true
      }
    },
    computed: {
      maxResults () {
        return this.showMax || this.results.length
      }
    },
    methods: {
      computedListItemClasses (index) {
        return Object.assign({'active': this.isActive(index)}, this.listItemClasses)
      },
      search () {
        this.inputFocused = true
        if (this.terms.length < this.dawaService.options.minLength) {
          this.$set(this, 'results', [])
        }
        this.getCaretPosition()
          .then(() => {
            if (this.caretPos !== this.oldCaretPos && this.terms.length >= this.dawaService.options.minLength) {
              // caret position is now updated, proceed with search
              this.dawaService.update(this.terms, this.caretPos)
            }
          })
      },
      handleResults (response) {
        this.emptyResultsList()
        let results = []
        if (response.length) {
          for (let item of response) {
            let obj = item
            results.push(obj)
          }
        }
        let max = this.showMax ? this.showMax : results.length
        this.$set(this, 'results', results.slice(0, max))
        this.$nextTick(() => {
          let resultsList = document.getElementById(this.containerId + '_' + 'results')
          if (resultsList) {
            let listHeight = resultsList.getBoundingClientRect().height
            this.$emit('listHeightUpdated', listHeight)
          }
        })
        if (this.results.length === 1 && this.initActions) {
          this.select(this.results[0])
          this.initActions = false
        }
      },
      select (item) {
        if (!item) {
          return
        }
        this.$emit('select', item)
        this.$set(this, 'selectedResult', item)
        this.$nextTick(() => {
          this.caretPos = item.caretpos
          this.inputFocused = true
          this.setCaretPosition(this.caretPos)
          this.currentIndex = 0
          this.emptyResultsList()
          // results aren't yet narrowed down to a full address, search again
          if ((this.terms.length >= this.defaultCaretPos && this.caretPos !== this.terms.length) || (item.type !== this.dawaService.options.type)) {
            this.dawaService.update(this.terms, this.caretPos)
          }
        })
      },
      enter () {
        this.select(this.results[this.currentIndex])
      },
      // When up pressed while suggestions are open
      up () {
        if (this.currentIndex > 0) {
          this.currentIndex--
        }
      },
      // When up pressed while suggestions are open
      down () {
        if (this.currentIndex < this.results.length - 1) {
          this.currentIndex++
        }
      },
      // For highlighting element
      isActive (index) {
        return index === this.currentIndex
      },
      emptyResultsList () {
        this.$set(this, 'results', [])
        this.$emit('listHeightUpdated', 0)
      },
      getCaretPosition () {
        return new Promise((resolve) => {
          setTimeout(() => {
            let position = getInputSelection(document.getElementById(this.fieldId)).start
            this.oldCaretPos = this.caretPos
            this.caretPos = position > this.defaultCaretPos ? position : this.defaultCaretPos
            resolve()
          }, 5)
        })
      },
      setCaretPosition (pos) {
        let elem = document.getElementById(this.fieldId)
        if (elem.setSelectionRange) {
          this.getCaretPosition()
          elem.setSelectionRange(pos, pos)
        }
        else if (elem.createTextRange) {
          let range = elem.createTextRange()
          range.collapse(true)
          range.moveEnd('character', pos)
          range.moveStart('character', pos)
          range.select()
        }
      }
    },
    watch: {
      val (newVal) {
        this.terms = newVal
        this.setCaretPosition(this.caretPos)
      }
    },

    created () {
      this.dawaService = new DawaService(this.options, this.handleResults)
      if (this.addressId && this.initActions) {
        this.dawaService.selectInitial(this.addressId)
      }
    }
  }
</script>
<style>
    .autocomplete-container {
        /* relative position for at de absolut positionerede forslag får korrekt placering.*/
        position: relative;
        width: 100%;
        max-width: 30em;
    }

    .autocomplete-container input {
        /* Både input og forslag får samme bredde som omkringliggende DIV */
        width: 100%;
        box-sizing: border-box;
        margin-bottom: 5px;
    }

    .dawa-autocomplete-suggestions {
        position: absolute;
        z-index: 9999;
        width: 100%;
        margin: 0.15em 0 0 0;
        padding: 0;
        text-align: left;
        border-radius: 0.3125em;
        background: #fcfcfc;
        box-shadow: 0 0.0625em 0.15625em rgba(0,0,0,.15);
        box-sizing: border-box;
    }

    .dawa-autocomplete-suggestions .dawa-autocomplete-suggestion {
        margin: 0;
        list-style: none;
        cursor: pointer;
        padding: 0.4em 0.6em;
        color: #333;
        border: 0.0625em solid #ddd;
        border-bottom-width: 0;
    }

    .dawa-autocomplete-suggestions .dawa-autocomplete-suggestion:first-child {
        border-top-left-radius: inherit;
        border-top-right-radius: inherit;
    }

    .dawa-autocomplete-suggestions .dawa-autocomplete-suggestion:last-child {
        border-bottom-left-radius: inherit;
        border-bottom-right-radius: inherit;
        border-bottom-width: 0.0625em;
    }

    .dawa-autocomplete-suggestions .dawa-autocomplete-suggestion.active,
    .dawa-autocomplete-suggestions .dawa-autocomplete-suggestion:hover {
        background: #f0f0f0;
        color: #333;
    }
</style>