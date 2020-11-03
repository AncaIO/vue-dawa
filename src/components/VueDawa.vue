<template>
  <div
    :id="containerId"
    ref="container"
    class="autocomplete-container"
    :class="containerClasses"
  >
    <form
      autocomplete="off"
      @submit.prevent
    >
      <slot name="label-top" />
      <input
        :id="fieldId"
        ref="input"
        v-model="terms"
        v-focus.lazy="inputFocused"
        type="search"
        :class="fieldClasses"
        :placeholder="placeholder"
        :name="fieldName"
        :cursor="caretPos"
        :disabled="disabled"
        @input="search()"
        @focus="search()"
        @keydown.left="search()"
        @keydown.right="search()"
        @keyup.enter="enter()"
        @keydown.down="down()"
        @keydown.up="up()"
        @keydown.esc="emptyResultsList()"
        @blur="inputFocused = false"
      >
      <slot name="label-bottom" />
      <ul
        v-if="results &&
          results.length > 0"
        :id="containerId + '_' + 'results'"
        ref="resultsList"
        class="dawa-autocomplete-suggestions"
        :class="listClasses"
        :style="resultsListStyle"
      >
        <li
          v-for="(result, index) of results"
          :id="'result_' + index"
          :key="index"
          :ref="'result_' + index"
          class="dawa-autocomplete-suggestion"
          :class="computedListItemClasses(index)"
          @click.prevent="select(result)"
          @enter.prevent="select(result)"
        >
          {{ result.oneLineAddress }}
        </li>
      </ul>
    </form>
  </div>
</template>
<script>
'use strict'
import { getInputSelection } from '../utils/utils'
import { DawaService } from '../services/dawa.service'
import { mixin } from '../directives/focus.directive'
export default {
  name: 'VueDawa',
  mixins: [mixin],
  props: {
    // optional placeholder
    placeholder: {
      required: false,
      type: String,
      default: ''
    },
    // better targetting
    containerId: {
      required: true,
      type: String
    },
    containerClasses: {
      type: [String, Object],
      default: ''
    },
    // for improved accessibility when used with label
    fieldId: {
      required: true,
      type: String
    },
    fieldClasses: {
      type: [String, Object],
      default: ''
    },
    // for use with form validation
    fieldName: {
      type: String,
      default: ''
    },
    listClasses: {
      type: [String, Object],
      default: ''
    },
    listItemClasses: {
      type: [String, Object],
      default: ''
    },
    // describe the field (optional)
    label: {
      required: false,
      type: String,
      default: ''
    },
    // determines the initial value of the field
    val: {
      required: false,
      type: String,
      default: ''
    },
    addressId: {
      required: false,
      type: String,
      default: ''
    },
    options: {
      type: Object,
      required: false,
      default: () => {
        return {}
      }
    },
    disabled: {
      type: Boolean,
      required: false,
      default: false
    },
    showMax: {
      type: Number,
      required: false,
      default: 5
    },
    resultsListStyle: {
      type: Object,
      default: () => {
        return {}
      }
    },
    listScrollBehavior: {
      type: Object,
      default: () => {
        return {
          behavior: 'smooth',
          block: 'center',
          inline: 'nearest'
        }
      }
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
      initActions: true,
      listHeight: 0
    }
  },
  computed: {
    maxResults () {
      return this.showMax || this.results.length
    }
  },
  watch: {
    val (newVal) {
      this.terms = newVal
      this.setCaretPosition(this.caretPos)
    },
    terms (newVal) {
      this.$emit('inputChanged', newVal)
    },
    listHeight (newVal) {
      this.$emit('listHeightUpdated', newVal)
    },
    results: {
      handler (newVal) {
        if (this.addressId) {
          this.select(newVal[0])
        }
      },
      immediate: true
    }
  },
  created () {
    this.dawaService = new DawaService(this.options, this.handleResults)
    if (this.addressId && this.initActions) {
      this.dawaService.selectInitial(this.addressId)
      this.initActions = false
    }
  },
  mounted () {
    document.addEventListener('click', this.handleClickOutside, true)
    document.addEventListener('focus', this.handleClickOutside, true)
  },
  beforeDestroy () {
    document.removeEventListener('click', this.handleClickOutside, true)
    document.removeEventListener('focus', this.handleClickOutside, true)
  },
  methods: {
    computedListItemClasses (index) {
      return Object.assign(
        { active: this.isActive(index) },
        this.listItemClasses
      )
    },
    search () {
      this.inputFocused = true
      this.currentIndex = 0
      if (
        this.terms &&
        this.terms.length < this.dawaService.options.minLength
      ) {
        this.$set(this, 'results', [])
        this.listHeight = 0
      }
      this.getCaretPosition().then(() => {
        if (
          this.caretPos !== this.oldCaretPos &&
          this.terms &&
          this.terms.length >= this.dawaService.options.minLength
        ) {
          // caret position is now updated, proceed with search
          this.dawaService.update(this.terms, this.caretPos)
        }
      })
    },
    handleResults (response) {
      this.emptyResultsList()
      const results = []
      if (response.length) {
        for (const item of response) {
          let rows = item.forslagstekst.split('\n')
          rows = rows.map(row => row.replace(/ /g, '\u00a0'))
          item.oneLineAddress = rows.join(', ')
          results.push(item)
        }
      }
      const max = this.showMax ? this.showMax : results.length
      this.$set(this, 'results', results.slice(0, max))
      this.$nextTick(() => {
        const resultsList = document.getElementById(
          this.containerId + '_' + 'results'
        )
        if (resultsList) {
          this.listHeight = resultsList.getBoundingClientRect().height
        }
      })
    },
    select (item) {
      if (!item) {
        return
      }
      this.$emit('select', item)
      this.$set(this, 'selectedResult', item)
      this.terms = this.selectedResult.tekst
      this.caretPos = item.caretpos
      this.inputFocused = true
      this.setCaretPosition(this.caretPos)
      this.currentIndex = 0
      this.emptyResultsList()
      // results aren't yet narrowed down to a full address, search again
      if (
        (this.terms.length >= this.defaultCaretPos &&
          this.caretPos !== this.terms.length) ||
        item.type !== this.dawaService.options.type ||
        this.results.length > 1
      ) {
        this.dawaService.select(item)
      }
    },
    enter () {
      this.select(this.results[this.currentIndex])
    },
    // When up pressed while suggestions are open
    up () {
      if (this.currentIndex > 0) {
        this.currentIndex--
      }
      this.scrollToResult(this.currentIndex)
    },
    // When up pressed while suggestions are open
    down () {
      if (this.currentIndex < this.results.length - 1) {
        this.currentIndex++
      }
      this.scrollToResult(this.currentIndex)
    },
    scrollToResult (index) {
      const el = document.getElementById(`result_${index}`)
      el.scrollIntoView(this.listScrollBehavior)
    },
    // For highlighting element
    isActive (index) {
      return index === this.currentIndex
    },
    emptyResultsList () {
      this.listHeight = 0
      this.$set(this, 'results', [])
    },
    getCaretPosition () {
      return new Promise(resolve => {
        setTimeout(() => {
          const position = getInputSelection(
            document.getElementById(this.fieldId)
          ).start
          this.oldCaretPos = this.caretPos
          this.caretPos =
            position > this.defaultCaretPos ? position : this.defaultCaretPos
          resolve()
        }, 5)
      })
    },
    setCaretPosition (pos) {
      const elem = document.getElementById(this.fieldId)
      if (elem.setSelectionRange) {
        this.getCaretPosition()
        elem.setSelectionRange(pos, pos)
      } else if (elem.createTextRange) {
        const range = elem.createTextRange()
        range.collapse(true)
        range.moveEnd('character', pos)
        range.moveStart('character', pos)
        range.select()
      }
    },
    handleClickOutside (e) {
      const el = this.$refs.container
      if (
        (e.target !== this.$refs.input &&
          e.target !== this.$refs.resultsList) ||
        !el.contains(e.target)
      ) {
        this.emptyResultsList()
      }
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
  box-shadow: 0 0.0625em 0.15625em rgba(0, 0, 0, 0.15);
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
