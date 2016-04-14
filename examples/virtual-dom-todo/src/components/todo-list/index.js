import { Observable} from 'rxjs/Observable'
import h from 'virtual-dom/h'
import subscriptions from '../../../../../src/composite-subscription'
import VirtualDOMComponent from '../../../../../src/virtual-dom-component'
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

class TodoList extends VirtualDOMComponent {
  constructor(el) {
    super(el)

    this.vm = new TodoListViewModel({ todos: [] })

    this.subscription = subscriptions(
      this.event('new-todo', 'keypress')
        .filter(e => e.which === 13)
        .map(e => e.target.value)
        .subscribe(this.vm.create()),

      this.event('edit', 'keypress')
        .filter(e => e.which === 13)
        .map(e => [id(e.target), e.target.value])
        .subscribe(this.vm.update()),

      this.event('todo', 'dblclick')
        .map(e => id(e.target))
        .subscribe(this.vm.editing(true)),

      Observable.merge(
        this.event('edit', 'blur'),
        this.event('edit', 'keydown')
          .filter(e => e.which === 27))
        .map(e => id(e.target))
        .subscribe(this.vm.editing(false)),

      this.event('toggle', 'change')
        .map(e => id(e.target))
        .subscribe(this.vm.toggle()),

      this.event('destroy', 'click')
        .map(e => id(e.target))
        .subscribe(this.vm.remove()))
    
    this.bindDOM()
  }

  render() {
    return Observable.combineLatest(
      this.vm.todos.observable,
      this.vm.remining.observable,
      this.vm.completed.observable,
      (todos, remining, completed) => h('div', [
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
              attributes: { 'data-id': i }
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
      ]))
  }
}

export default TodoList
