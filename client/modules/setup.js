import JsonEditor from '@redgoose/json-editor'
import { setup as toastSetup } from './toast/index.js'
import { markedSetup } from './markdown.js'

export default function setupModules()
{
  // toast
  toastSetup({
    delay: 3000,
  })

  // setup marked
  markedSetup()

  // json-editor
  JsonEditor.prototype.updateLanguage = function()
  {
    this.lang = Object.assign(this.lang, {
      nodeChangeSort: '노드 순서변경',
      nodeContextMenu: '노드메뉴',
      nodeFold: '접기/펼치기',
      contextChangeType: '타입변경',
      contextInsertNode: '노드추가',
      contextTypeObject: '객체',
      contextTypeArray: '배열',
      contextTypeString: '문자',
      contextTypeNumber: '번호',
      contextTypeBoolean: '부울',
      contextTypeNull: '널',
      contextDuplicate: '노드복제',
      contextRemove: '노드삭제',
    })
  }
}
