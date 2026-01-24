# Ralph Wiggum Plugin - Installation Complete! 🎉

Ralph Wiggum Plugin ถูกติดตั้งเรียบร้อยแล้วในโปรเจคของคุณ

## 📁 โครงสร้างไฟล์ที่ติดตั้ง

```
.claude/
├── settings.local.json          # การตั้งค่า Ralph plugin
├── hooks/
│   └── ralph-stop.sh           # Stop hook สำหรับ Ralph Loop
├── PRPs/
│   └── plans/
│       └── example-task.plan.md # ตัวอย่าง plan file
└── README.md                    # คู่มือนี้
```

## 🚀 วิธีการใช้งาน Ralph Loop

### วิธีที่ 1: ใช้งานแบบ Direct Prompt

ให้คำสั่งกับ Claude โดยตรง:

```
ฉันต้องการให้คุณทำงานแบบ Ralph Loop:

[Task Description]
- สร้าง REST API สำหรับจัดการ todos
- เขียน tests ให้ครบทุก endpoint
- ตรวจสอบว่า tests ผ่านทั้งหมด
- แก้ไข bugs ที่เจอจนกว่า tests จะผ่านหมด

เมื่อเสร็จสมบูรณ์ ให้ output: <promise>COMPLETE</promise>

Ralph Loop Settings:
- Max iterations: 20
- Completion promise: COMPLETE
```

### วิธีที่ 2: ใช้งานผ่าน Plan File

1. สร้าง plan file ใน `.claude/PRPs/plans/your-task.plan.md`
2. ตั้งค่า environment variables:

```bash
export RALPH_MAX_ITERATIONS=20
export RALPH_COMPLETION_PROMISE="COMPLETE"
```

3. ให้คำสั่งกับ Claude:

```
กรุณาทำงานตาม plan file .claude/PRPs/plans/your-task.plan.md
โดยใช้ Ralph Loop จนกว่างานจะเสร็จสมบูรณ์
```

## ⚙️ การตั้งค่า

แก้ไขไฟล์ [.claude/settings.local.json](.claude/settings.local.json):

```json
{
  "hooks": {
    "stop": ".claude/hooks/ralph-stop.sh"
  },
  "ralphLoop": {
    "enabled": true,
    "maxIterations": 50,          // จำนวนรอบสูงสุด
    "defaultCompletionPromise": "COMPLETE"  // คำสัญญาเมื่องานเสร็จ
  }
}
```

## 📊 ติดตามความคืบหน้า

Ralph Loop จะเก็บ state ไว้ที่:
- [.claude/prp-ralph.state.md](.claude/prp-ralph.state.md) (จะถูกสร้างเมื่อเริ่ม loop)

## 🎯 Best Practices

### 1. เขียน Completion Criteria ที่ชัดเจน
```
✅ ดี: "All tests pass with >80% coverage AND no linting errors"
❌ ไม่ดี: "Make it work"
```

### 2. ใช้ Validation Commands
```bash
npm test
npm run lint
npm run build
```

### 3. ตั้ง Max Iterations ที่เหมาะสม
- งานเล็ก: 10-20 iterations
- งานกลาง: 20-50 iterations
- งานใหญ่: 50-100 iterations

### 4. ใช้ Promise Tags อย่างถูกต้อง
```
เมื่อเสร็จทุกอย่างแล้ว output:
<promise>COMPLETE</promise>
```

## 🔍 ตัวอย่างการใช้งาน

### Example 1: ติดตั้ง Authentication System
```
Ralph Loop Task:

1. ติดตั้ง JWT authentication
2. สร้าง login/register endpoints
3. เพิ่ม middleware สำหรับ protect routes
4. เขียน tests ครบทุก endpoint
5. แก้ไข bugs จนกว่า tests จะผ่านหมด

Validation:
- npm test (must pass 100%)
- npm run lint (no errors)

Output <promise>AUTH_COMPLETE</promise> when done.

Max iterations: 30
```

### Example 2: แก้ไข Bug และ Refactor
```
Ralph Loop Task:

Fix the performance issue in /api/chat/message endpoint:
1. Profile the code to find bottlenecks
2. Implement optimizations
3. Run performance tests
4. Ensure response time < 200ms
5. Refactor if needed

Output <promise>OPTIMIZED</promise> when complete.

Max iterations: 15
```

## 📝 หมายเหตุ

- Ralph Loop จะทำงานแบบวนซ้ำจนกว่างานจะเสร็จหรือถึง max iterations
- ในแต่ละรอบ Claude จะเห็นผลลัพธ์จากรอบก่อนหน้าผ่าน git history และไฟล์ที่เปลี่ยนแปลง
- Stop hook จะตรวจสอบว่างานเสร็จหรือยัง (หา completion promise)
- ถ้ายังไม่เสร็จ จะ loop ต่อพร้อม feedback จากรอบก่อนหน้า

## 🔗 แหล่งข้อมูลเพิ่มเติม

- [Ralph Technique by Geoffrey Huntley](https://ghuntley.com/ralph/)
- [Claude Code Plugins](https://github.com/anthropics/claude-code/tree/main/plugins)
- [PRPs Agentic Engineering](https://github.com/Wirasm/PRPs-agentic-eng)

---

**Happy Ralph Looping! 🎭**
