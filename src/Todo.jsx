import React from "react";
import axios from "axios";
import { useState, useEffect } from "react";
import { API_BASE } from "./global";
import { Formik, Form, Field, ErrorMessage } from "formik";
import * as Yup from "yup";

const validationSchema = Yup.object().shape({
  newTodo: Yup.string().required("Task is required"),
});

export default function Todo() {
  const [todos, setTodos] = useState([]);
  const [popupActive, setPopupActive] = useState(false);

  useEffect(() => {
    getTodos();
  }, []);

  const getTodos = () => {
    axios
      .get(`${API_BASE}/todos`)
      .then((res) => setTodos(res.data))
      .catch((err) => console.error("Error: ", err));
  };

  const completeTodo = async (id) => {
    try {
      const { data } = await axios.get(`${API_BASE}/todo/complete/${id}`);

      setTodos((todos) =>
        todos.map((todo) => {
          if (todo._id === data._id) {
            todo.complete = data.complete;
          }
          return todo;
        })
      );
    } catch (error) {
      console.error("Failed to complete todo:", error);
    }
  };

  const deleteTodo = async (id) => {
    try {
      await axios.delete(`${API_BASE}/todo/delete/${id}`);
      setTodos((todos) => todos.filter((todo) => todo._id !== id));
      getTodos();
    } catch (error) {
      console.error("Failed to delete todo:", error);
    }
  };

  const addTodo = async (values, { resetForm }) => {
    try {
      const { data } = await axios.post(`${API_BASE}/todo/new`, {
        text: values.newTodo,
      });
      setTodos([...todos, data]);
      setPopupActive(false);
      resetForm();
    } catch (error) {
      console.error("Failed to add todo:", error);
    }
  };

  return (
    <div>
      <h1>To Do List</h1>
      <h4>Your Tasks</h4>
      <div className="todos">
        {todos.map((todo) => (
          <div
            className={`todo ${todo.complete ? "is-complete" : ""}`}
            key={todo._id}
            onClick={() => completeTodo(todo._id)}
          >
            <div className="checkbox"></div>
            <div className="text">{todo.text}</div>
            <div className="delete-todo" onClick={() => deleteTodo(todo._id)}>
              x
            </div>
          </div>
        ))}
      </div>

      <div className="addPopup" onClick={() => setPopupActive(true)}>
        +
      </div>

      {popupActive ? (
        <div className="popup">
          <div className="closePopup" onClick={() => setPopupActive(false)}>
            x
          </div>
          <div className="content">
            <h3>Add Task</h3>
            <Formik
              initialValues={{ newTodo: "" }}
              validationSchema={validationSchema}
              onSubmit={addTodo}
            >
              <Form>
                <Field type="text" name="newTodo" className="add-todo-input" />
                <ErrorMessage
                  name="newTodo"
                  component="div"
                  className="error-message"
                />

                <button className="button" type="submit">
                  Create Task
                </button>
              </Form>
            </Formik>
          </div>
        </div>
      ) : (
        ""
      )}
    </div>
  );
}
