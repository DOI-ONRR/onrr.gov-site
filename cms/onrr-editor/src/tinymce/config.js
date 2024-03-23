const specialChars = [
  { text: 'Form ONRR-2014 — ASCII Record Layout', value: 'ASC2014Rev.pdf' },
  { text: 'Form ONRR-2014 — Complete List of Edits', value: '2014CLEdits.pdf' },
  { text: 'Form ONRR-2014 — CSV Record Layout', value: 'CSV2014Rev.pdf' },
  { text: 'Form ONRR-2014 CSV Sample File', value: 'SamExcel2014csv.xlsx' },
  {
    text: 'Form ONRR-2014 Geothermal Codes',
    value: 'Geothermal Codes for Form ONRR-2014.docx'
  },
  {
    text: 'Form ONRR-4054 Frequently Asked Questions',
    value: 'Reporter Training FAQ- Production.docx'
  },
  { text: 'Form ONRR-4054: Part A', value: '4054-A.pdf' },
  { text: 'Form ONRR-4054: Part B', value: '4054-B.pdf' },
  { text: 'Form ONRR-4054: Part C', value: '4054-C.pdf' },
  {
    text: 'Form ONRR-4292: Schedule 1A and instructions',
    value: '4292s1a.pdf'
  },
  { text: 'Form ONRR-4292: Schedule 1 and instructions', value: '4292s1.pdf' },
  {
    text: 'Form ONRR-4292: Schedule 1B and instructions',
    value: '4292s1b.pdf'
  },
  {
    text: 'Form ONRR-4292: Supplemental Schedule 1A and instructions',
    value: '4292ss1a.pdf'
  },
  { text: 'Form ONRR-4293: Schedule 1 and instructions', value: '4293s1.pdf' },
  {
    text: 'Form ONRR-4293: Supplemental Schedule 1A and instructions',
    value: '4293ss1a.pdf'
  },
  { text: 'Form ONRR-4295, schedules, and instructions', value: '4295.pdf' },
  { text: 'Form ONRR-4393', value: '4393.pdf' },
  { text: 'Form ONRR-4430 (P&R) Training ', value: 'Form.ONRR-4430.PR.pptx' },
  { text: 'Form ONRR-4435', value: '4435.pdf' },
  { text: 'Form ONRR-4436', value: '4436.pdf' },
  { text: 'Form ONRR-4437', value: '4437.pdf' },
  { text: 'Form ONRR-4440 instructions', value: '4440Instr.pdf' },
  { text: 'Form ONRR-4444 Instructions', value: 'ONRR4444_Instructions.pdf' }
]
  
const config = {
  toolbar: 'lists link image table code',
  plugins: 'lists link image table code help wordcount',
  menubar: false,
  promotion: false,
  branding: false,
  setup: function (editor) {
    const onAction = (autocompleteApi, rng, value) => {
      const doc = JSON.parse(value)
      editor.selection.setRng(rng)
      editor.insertContent(`<a href='${doc.file}'>${doc.title}</a>`)
      autocompleteApi.hide()
    }

    const getMatchedChars = pattern => {
      return specialChars.filter(char => char.text.indexOf(pattern) !== -1)
    }

    editor.ui.registry.addAutocompleter('specialchars_cardmenuitems', {
      trigger: ':',
      minChars: 1,
      columns: 1,
      highlightOn: ['char_name'],
      onAction: onAction,
      fetch: pattern => {
        return new Promise(resolve => {
          const results = getMatchedChars(pattern).map(char => ({
            type: 'cardmenuitem',
            value: JSON.stringify({
              title: char.text,
              file: char.value
            }),
            label: char.text,
            items: [
              {
                type: 'cardcontainer',
                direction: 'vertical',
                items: [
                  {
                    type: 'cardtext',
                    text: char.text,
                    name: 'char_name'
                  }
                ]
              }
            ]
          }))
          resolve(results)
        })
      }
    })
  }
}

export default { config }
