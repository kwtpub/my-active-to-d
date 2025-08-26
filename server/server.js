import http from "http";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const PORT = 3000;

// CORS headers для всех ответов
const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization"
};

const server = http.createServer((req, res) => {
  // Обработка preflight OPTIONS запросов
  if (req.method === "OPTIONS") {
    res.writeHead(204, corsHeaders);
    res.end();
    return;
  }

  // Устанавливаем CORS headers для всех ответов
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  // GET /todos - получение всех задач
  if (req.method === "GET" && req.url === "/todos") {
    fs.readFile(path.join(__dirname, "data.json"), "utf-8", (err, data) => {
      if (err) {
        res.writeHead(500, {
          "Content-Type": "application/json",
          ...corsHeaders
        });
        res.end(JSON.stringify({ error: "Не удалось прочитать файл" }));
      } else {
        res.writeHead(200, {
          "Content-Type": "application/json",
          ...corsHeaders
        });
        res.end(data);
      }
    });
  }

  // POST /todos - сохранение всех задач
  else if (req.method === "POST" && req.url === "/todos") {
    let body = "";
    
    req.on("data", chunk => {
      body += chunk.toString();
    });

    req.on("end", () => {
      try {
        const todos = JSON.parse(body);
        
        fs.writeFile(path.join(__dirname, "data.json"), JSON.stringify(todos, null, 2), (err) => {
          if (err) {
            res.writeHead(500, {
              "Content-Type": "application/json",
              ...corsHeaders
            });
            res.end(JSON.stringify({ error: "Не удалось сохранить файл" }));
          } else {
            res.writeHead(200, {
              "Content-Type": "application/json",
              ...corsHeaders
            });
            res.end(JSON.stringify({ success: true, message: "Данные сохранены" }));
          }
        });
      } catch (error) {
        res.writeHead(400, {
          "Content-Type": "application/json",
          ...corsHeaders
        });
        res.end(JSON.stringify({ error: "Неверный JSON формат" }));
      }
    });
  }

  // PUT /todos/:id - обновление конкретной задачи
  else if (req.method === "PUT" && req.url.startsWith("/todos/")) {
    const id = req.url.split("/")[2];
    let body = "";

    req.on("data", chunk => {
      body += chunk.toString();
    });

    req.on("end", () => {
      fs.readFile(path.join(__dirname, "data.json"), "utf-8", (err, data) => {
        if (err) {
          res.writeHead(500, {
            "Content-Type": "application/json",
            ...corsHeaders
          });
          res.end(JSON.stringify({ error: "Не удалось прочитать файл" }));
          return;
        }

        try {
          const todos = JSON.parse(data);
          const updatedTodo = JSON.parse(body);
          const todoIndex = todos.findIndex(todo => todo.id.toString() === id.toString());

          if (todoIndex === -1) {
            res.writeHead(404, {
              "Content-Type": "application/json",
              ...corsHeaders
            });
            res.end(JSON.stringify({ error: "Задача не найдена" }));
            return;
          }

          todos[todoIndex] = { ...todos[todoIndex], ...updatedTodo };

          fs.writeFile(path.join(__dirname, "data.json"), JSON.stringify(todos, null, 2), (err) => {
            if (err) {
              res.writeHead(500, {
                "Content-Type": "application/json",
                ...corsHeaders
              });
              res.end(JSON.stringify({ error: "Не удалось обновить файл" }));
            } else {
              res.writeHead(200, {
                "Content-Type": "application/json",
                ...corsHeaders
              });
              res.end(JSON.stringify(todos[todoIndex]));
            }
          });
        } catch (error) {
          res.writeHead(400, {
            "Content-Type": "application/json",
            ...corsHeaders
          });
          res.end(JSON.stringify({ error: "Неверный JSON формат" }));
        }
      });
    });
  }

  // DELETE /todos/:id - удаление задачи
  else if (req.method === "DELETE" && req.url.startsWith("/todos/")) {
    const id = req.url.split("/")[2];

    fs.readFile(path.join(__dirname, "data.json"), "utf-8", (err, data) => {
      if (err) {
        res.writeHead(500, {
          "Content-Type": "application/json",
          ...corsHeaders
        });
        res.end(JSON.stringify({ error: "Не удалось прочитать файл" }));
        return;
      }

      try {
        const todos = JSON.parse(data);
        const filteredTodos = todos.filter(todo => todo.id !== id);

        if (todos.length === filteredTodos.length) {
          res.writeHead(404, {
            "Content-Type": "application/json",
            ...corsHeaders
          });
          res.end(JSON.stringify({ error: "Задача не найдена" }));
          return;
        }

        fs.writeFile(path.join(__dirname, "data.json"), JSON.stringify(filteredTodos, null, 2), (err) => {
          if (err) {
            res.writeHead(500, {
              "Content-Type": "application/json",
              ...corsHeaders
            });
            res.end(JSON.stringify({ error: "Не удалось обновить файл" }));
          } else {
            res.writeHead(200, {
              "Content-Type": "application/json",
              ...corsHeaders
            });
            res.end(JSON.stringify({ success: true, message: "Задача удалена" }));
          }
        });
      } catch (error) {
        res.writeHead(400, {
          "Content-Type": "application/json",
          ...corsHeaders
        });
        res.end(JSON.stringify({ error: "Неверный JSON формат" }));
      }
    });
  }

  // Все остальные маршруты
  else {
    res.writeHead(404, {
      "Content-Type": "application/json",
      ...corsHeaders
    });
    res.end(JSON.stringify({ error: "Not Found" }));
  }
});

server.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
