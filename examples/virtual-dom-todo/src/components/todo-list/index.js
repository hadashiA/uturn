import {Observable, Subject} from 'rxjs/Rx'
import h from 'virtual-dom/h'

import Component from '../../component'
import TodoListViewModel from './view-model'

function id(el) {
  let parent = el
  while (parent) {
    if (parent.dataset && parent.dataset.id) {
      return parent.dataset.id
    }
    parent = parent.parentNode
  }
  return null
}

class TodoList extends Component {
  constructor(el) {
    super(el)

    this.vm = new TodoListViewModel({ todos: [] })
    
    this.event('new-todo', 'keypress')
      .filter(e => e.which === 13)
      .map(e => e.target.value)
      .subscribe(this.vm.create)

    this.event('edit', 'keypress')
      .filter(e => e.which === 13)
      .map(e => [id(e.target), e.target.value])
      .subscribe(this.vm.update)

    this.event('todo', 'dblclick')
      .map(e => [id(e.target), true])
      .subscribe(this.vm.editing)

    Observable.merge(
      this.event('edit', 'blur'),
      this.event('edit', 'keydown').filter(e => e.which === 27))
      .map(e => false)
      .subscribe(this.vm.editing)

    this.event('toggle', 'change')
      .map(e => id(e.target))
      .subscribe(this.vm.toggle)

    this.event('destroy', 'click')
      .map(e => id(e.target))
      .subscribe(this.vm.destroy)
    
    this.bindDOM()
  }

  render() {
    return this.vm.todos.observable
      .map(todos => {
        const remining  = todos.filter(todo => !todo.completed).length
        const completed = todos.length > 0 && remining === 0

        return h('div', [
          h('section.todoapp', [
            h('header.header', [
              h('h1', 'todos'),
              h('input.new-todo', { placeholder: 'What needs to be done?', autofocus: true })
            ]),

            h('sestion.main', [
              h('input#toggle-all.toggle-all', { type: 'checkbox', checked: false }),
              h('label', { for: 'toggle-all' }),
              h('ul.todo-list', todos.map((todo, i) => h('li', {
                className: (todo.editing ? 'editing' : ''),
                attributes: { 'data-index': i }
              }, [
                todo.editing ? h('input.edit', {value: todo.title }) :
                h('div.view', [
                  h('input.toggle', { type: 'checkbox', checked: todo.completed }),
                  h('label.todo', todo.title),
                  h('button.destroy')
                ])
              ])))
            ]),

            remining > 0 ?
              h('footer.footer', [
                h('span.todo-count', [
                  h('string', `${remining}`),
                  remining <= 1 ? ' Item' : ' Items'
                ]),
                h('ul.filters', [
                  h('li', h('a.selected', { href: '#' }, 'All')),
                  h('li', h('a', { href: '#' }, 'Active')),
                  h('li', h('a', { href: '#'}, 'Completed')),
                  (completed ? h('button.clear-completed', 'Clear completed') : null)
                ])
              ]) :
            null
          ]),
        
          h('footer.info', [
            h('p', 'Double-click to edit a todo'),
            h('p', 'Writen by')
          ])
        ])
      })
  }
}

export default TodoList
