import { Observable } from 'rxjs/Observable'
import { Subject } from 'rxjs/Subject'
import ViewModel from '../../view-model'

class TodoListViewModel extends ViewModel {
  constructor({ todos = [] } = {}) {
    super({ todos })

    this.remining = this.todos.observable
      .map(todos => {
        return todos.filter(todo => !todo.completed).length
      })
      .toVariable(0)

    this.completed = Observable.combineLatest(
      this.todos.observable,
      this.remining.observable,
      (todos, remining) => {
        return todos.length > 0 && remining === 0
      })
      .toVariable(false)
  }

  create(title) {
    let todos = this.todos.value
    todos.push({ title })
    this.todos.value = todos
  }

  update(i, { title, editing, completed }) {
    let todos = this.todos.value
    if (title) {
      todos[i].title = title
    }
    if (editing) {
      todos[i].editing = editing
    }
    if (completed) {
      todos[i].completed = completed
    }
    this.todos.value = todos
  }

  remove(i) {
    let todos = this.todos.value
    todos.splice(1, 1)
    this.todos.value = todos
  }
}

export default TodoListViewModel
