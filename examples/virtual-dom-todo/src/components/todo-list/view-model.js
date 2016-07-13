import { Observable } from 'rxjs/Observable'
import { Subject } from 'rxjs/Subject'
import { ViewModel } from 'uturn'

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

  create() {
    return title => {
      let todos = this.todos.value
      todos.push({ title })
      this.todos.value = todos
    }
  }

  update() {
    return (i, title) => {
      let todos = this.todos.value
      todos[i].title = title
      this.todos.value = todos
    }
  }

  editing(on) {
    return i => {
      let todos = this.todos.value
      todos[i].editing = on
      this.todos.value = todos
    }
  }
  
  toggle() {
    return i => {
      let todos = this.todos.value
      todos[i].completed = !todos[i].completed
      this.todos.value = todos
    }
  }

  remove() {
    return i => {
      let todos = this.todos.value
      todos.splice(1, 1)
      this.todos.value = todos
    }
  }
}

export default TodoListViewModel
