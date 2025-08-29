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
else if (req.method === "POST" && req.url === "/todos") {
  let body = "";
  
  req.on("data", chunk => {
    body += chunk.toString();
  });

  req.on("end", () => {
    try {
      const newTodo = JSON.parse(body);
      
      // Читаем текущие задачи
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
          
          // Генерируем новый ID (максимальный ID + 1)
          const newId = Math.max(...todos.map(t => t.id), 0) + 1;
          
          // Создаем новую задачу
          const todoToAdd = {
            id: newId,
            title: newTodo.title,
            done: false
          };

          // Добавляем в массив
          todos.push(todoToAdd);

          // Сохраняем обратно в файл
          fs.writeFile(path.join(__dirname, "data.json"), JSON.stringify(todos, null, 2), (err) => {
            if (err) {
              res.writeHead(500, {
                "Content-Type": "application/json",
                ...corsHeaders
              });
              res.end(JSON.stringify({ error: "Не удалось сохранить файл" }));
            } else {
              res.writeHead(201, {
                "Content-Type": "application/json",
                ...corsHeaders
              });
              res.end(JSON.stringify(todoToAdd)); // Возвращаем созданную задачу
            }
          });
        } catch (error) {
          res.writeHead(400, {
            "Content-Type": "application/json",
            ...corsHeaders
          });
          res.end(JSON.stringify({ error: "Неверный формат данных в файле" }));
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

// После POST обработчика добавьте:
else if (req.method === "DELETE" && req.url.startsWith("/todos/")) {
  const id = req.url.split("/")[2]; // получаем ID из URL
  console.log('DELETE request for ID:', id);

  fs.readFile(path.join(__dirname, "data.json"), "utf-8", (err, data) => {
    if (err) {
      res.writeHead(500, {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*"
      });
      res.end(JSON.stringify({ error: "Не удалось прочитать файл" }));
      return;
    }

    try {
      const todos = JSON.parse(data);
      
      // Ищем задачу (сравниваем как строки)
      const todoIndex = todos.findIndex(todo => 
        todo.id.toString() === id.toString()
      );

      console.log('Found index:', todoIndex, 'Total tasks:', todos.length);

      if (todoIndex === -1) {
        res.writeHead(404, {
          "Content-Type": "application/json",
          "Access-Control-Allow-Origin": "*"
        });
        res.end(JSON.stringify({ 
          error: "Задача не найдена",
          requestedId: id,
          availableIds: todos.map(t => t.id)
        }));
        return;
      }

      // Удаляем задачу из массива
      const deletedTodo = todos.splice(todoIndex, 1)[0];
      console.log('Deleted task:', deletedTodo);

      // Сохраняем обновленный массив
      fs.writeFile(path.join(__dirname, "data.json"), JSON.stringify(todos, null, 2), (err) => {
        if (err) {
          res.writeHead(500, {
            "Content-Type": "application/json",
            "Access-Control-Allow-Origin": "*"
          });
          res.end(JSON.stringify({ error: "Не удалось сохранить файл" }));
        } else {
          res.writeHead(200, {
            "Content-Type": "application/json",
            "Access-Control-Allow-Origin": "*"
          });
          res.end(JSON.stringify({ 
            success: true, 
            message: "Задача удалена",
            deleted: deletedTodo 
          }));
        }
      });
    } catch (error) {
      res.writeHead(400, {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*"
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
