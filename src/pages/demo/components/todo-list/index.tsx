import { useState, useEffect } from 'react';
import * as styles from './index.module.less';
import { Button, Form, Input, Space, storage, useFormState, usePageVisible } from 'sweet-me';
import { Comp } from '../type';

storage.config({ namespace: 'todo-list', sync: true, params: { dodokey: 777 } });

export const TodoList: Comp = ({ style, visible }) => {
  const [todos, setTodos] = useState([]);
  const { pageVisible } = usePageVisible();
  const { form } = useFormState();

  useEffect(() => {
    if (!visible && !pageVisible) return;

    setTodos(storage.localGet('todos') || []);
    storage.get('todos').then(storedTodos => {
      if (storedTodos) {
        setTodos(storedTodos);
      }
    });
  }, [visible, pageVisible]);

  const updateTodoStore = (todoInfo) => {
    setTodos(todoInfo);
    storage.set('todos', todoInfo);
  };

  const handleFormSubmit = (values?: { title: string }) => {
    const { title = '' } = values || {};

    if (!title.trim()) {
      return;
    }

    const newTodo = {
      id: Date.now(),
      text: title,
      completed: false
    };

    updateTodoStore([newTodo, ...todos]);
    form.resetField();
  };

  const handleTodoDelete = (id) => {
    updateTodoStore(todos.filter((todo) => todo.id !== id));
  };

  const handleTodoComplete = (id) => {
    const updatedTodos = todos.map((todo) => {
      if (todo.id === id) {
        return { ...todo, completed: !todo.completed };
      }
      return todo;
    }).sort((a) => a.completed ? 1 : -1);

    updateTodoStore(updatedTodos);
  };

  return (
    <div className={styles.todoCard} style={style}>
      <div className={styles.title}>Todo List</div>
      <Form form={form} onSubmit={handleFormSubmit}>
        <Space padding='10px 0'>
          <Form.Item field='title' className={styles.formItem}>
            <Input placeholder="输入待办..." />
          </Form.Item>
          <Button type="submit" status='success'>添加</Button>
        </Space>
      </Form>
      <div className={styles.todoList}>
        {todos.map((todo) => (
          <Space className={styles.todoItem} key={todo.id} padding='10px 0 0'>
            <input
              type="checkbox"
              checked={todo.completed}
              onChange={() => handleTodoComplete(todo.id)}
            />
            {todo.completed ? (
              <del className={styles.text}>{todo.text}</del>
            ) : (
              <span className={styles.text}>{todo.text}</span>
            )}
            <Button className={styles.btn} onClick={() => handleTodoDelete(todo.id)} size='small'>
              删除
            </Button>
          </Space>
        ))}
      </div>
    </div>
  );
};

TodoList.scale = 0.5;
TodoList.fitHeight = true;