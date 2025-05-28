/**
 * thongtinungvien controller
 */

import { factories } from '@strapi/strapi'
import * as fs from 'fs';
import * as path from 'path';

// Hàm ghi log
const logToFile = (message: string) => {
  const logFile = path.join(__dirname, '../../../../logs/thongtinungvien.log');
  const timestamp = new Date().toISOString();
  const logMessage = `${timestamp}: ${message}\n`;
  
  // Tạo thư mục logs nếu chưa tồn tại
  const logsDir = path.dirname(logFile);
  if (!fs.existsSync(logsDir)) {
    fs.mkdirSync(logsDir, { recursive: true });
  }
  
  fs.appendFileSync(logFile, logMessage);
}

export default factories.createCoreController('api::thongtinungvien.thongtinungvien', ({ strapi }) => ({
  async create(ctx) {
    try {
      // Log request data
      logToFile('Request received');
      logToFile(`Request body: ${JSON.stringify(ctx.request.body, null, 2)}`);

      // Kiểm tra email plugin
      if (!strapi.plugins['email']) {
        logToFile('Error: Email plugin not found');
        throw new Error('Email plugin not found');
      }
      if (!strapi.plugins['email'].services.email) {
        logToFile('Error: Email service not found');
        throw new Error('Email service not found');
      }
      logToFile('Email plugin check passed');

      // Lấy dữ liệu từ request body
      const formData = ctx.request.body.data;
      logToFile(`Form data: ${JSON.stringify(formData, null, 2)}`);

      // Gọi hàm create mặc định của Strapi
      logToFile('Calling super.create...');
      const { data } = await super.create(ctx);
      logToFile(`Create response: ${JSON.stringify(data, null, 2)}`);

      // Xử lý file CV
      let attachments = [];
      if (formData.cv) {
        try {
          logToFile(`Finding file with ID: ${formData.cv}`);
          const uploadFiles = await strapi.plugins.upload.services.upload.findMany({
            filters: {
              id: formData.cv
            }
          });
          
          if (uploadFiles && uploadFiles.length > 0) {
            const cvFile = uploadFiles[0];
            logToFile(`CV File found: ${JSON.stringify(cvFile, null, 2)}`);
            
            const filePath = path.join(process.cwd(), 'public', cvFile.url);
            logToFile(`File path: ${filePath}`);
            
            if (fs.existsSync(filePath)) {
              attachments.push({
                filename: cvFile.name,
                path: filePath
              });
              logToFile(`File added to attachments: ${filePath}`);
            } else {
              logToFile(`File not found at path: ${filePath}`);
            }
          } else {
            logToFile('No file found with the given ID');
          }
        } catch (fileErr) {
          logToFile(`Error processing CV file: ${fileErr.message}`);
          logToFile(`File error details: ${JSON.stringify(fileErr, null, 2)}`);
        }
      }

      // Chuẩn bị email
      const emailData = {
        to: 'nguyenltce180386@fpt.edu.vn',
        from: 'nguyenltce180386@fpt.edu.vn',
        subject: 'Có ứng viên mới nộp đơn',
        attachments: attachments,
        text: `
          Xin chào Admin,
          
          Có ứng viên mới nộp đơn. Dưới đây là thông tin chi tiết:
          
          Thông tin cá nhân:
          - Họ và tên: ${formData.hovaten || 'Không có'}
          - Email: ${formData.mail || 'Không có'}
          - Số điện thoại: ${formData.sdt || 'Không có'}
          - Giới tính: ${formData.gioitinh || 'Không có'}
          - Ngày sinh: ${formData.ngaysinh || 'Không có'}/${formData.thangsinh || 'Không có'}/${formData.namsinh || 'Không có'}
          
          Thông tin học vấn:
          - Trường đại học: ${formData.truongdaihoc || 'Không có'}
          - Chuyên ngành: ${formData.chuyennganh || 'Không có'}
          - Bằng cấp: ${formData.bangcap || 'Không có'}
          - Thời gian nhận bằng: ${formData.thangnhanbang || 'Không có'}/${formData.namnhanbang || 'Không có'}
          
          Kinh nghiệm làm việc:
          - Công ty gần đây: ${formData.kinhnghiemcongtyganday || 'Không có'}
          - Công việc gần đây: ${formData.kinhnghiemcongviecganday || 'Không có'}
          - Thời gian: Từ ${formData.kinhnghiemtuthang || 'Không có'}/${formData.kinhnghiemtunam || 'Không có'} 
            đến ${formData.kinhnghiemdenthang || 'Không có'}/${formData.kinhnghiemdennam || 'Không có'}
          
          Thông tin khác:
          ${formData.thongtinkhac || 'Không có'}
          
          ${attachments.length > 0 ? 'CV đã được đính kèm trong email.' : 'Không có CV đính kèm.'}
          
          Vui lòng kiểm tra trong admin panel để xem thêm chi tiết.
        `,
        html: `
          <!DOCTYPE html>
          <html>
          <head>
            <style>
              body {
                font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
                line-height: 1.6;
                color: #333;
                max-width: 800px;
                margin: 0 auto;
                padding: 20px;
              }
              .header {
                background-color: #dc3545;
                color: white;
                padding: 20px;
                text-align: center;
                border-radius: 5px 5px 0 0;
              }
              .content {
                background-color: #f9f9f9;
                padding: 20px;
                border: 1px solid #ddd;
                border-radius: 0 0 5px 5px;
              }
              .section {
                background-color: white;
                padding: 15px;
                margin-bottom: 20px;
                border-radius: 5px;
                box-shadow: 0 2px 4px rgba(0,0,0,0.1);
              }
              .section h3 {
                color: #dc3545;
                margin-top: 0;
                border-bottom: 2px solid #dc3545;
                padding-bottom: 10px;
              }
              .field {
                margin-bottom: 10px;
              }
              .label {
                font-weight: bold;
                color: #666;
                min-width: 150px;
                display: inline-block;
              }
              .value {
                color: #333;
              }
              .footer {
                text-align: center;
                margin-top: 20px;
                padding: 20px;
                color: #666;
              }
              .cv-status {
                background-color: ${attachments.length > 0 ? '#d4edda' : '#fff3cd'};
                color: ${attachments.length > 0 ? '#155724' : '#856404'};
                padding: 10px;
                border-radius: 5px;
                margin: 20px 0;
                text-align: center;
              }
            </style>
          </head>
          <body>
            <div class="header">
              <h2>Thông Báo Ứng Viên Mới</h2>
            </div>
            
            <div class="content">
              <div class="section">
                <h3>Thông Tin Cá Nhân</h3>
                <div class="field">
                  <span class="label">Họ và tên:</span>
                  <span class="value">${formData.hovaten || 'Không có'}</span>
                </div>
                <div class="field">
                  <span class="label">Email:</span>
                  <span class="value">${formData.mail || 'Không có'}</span>
                </div>
                <div class="field">
                  <span class="label">Số điện thoại:</span>
                  <span class="value">${formData.sdt || 'Không có'}</span>
                </div>
                <div class="field">
                  <span class="label">Giới tính:</span>
                  <span class="value">${formData.gioitinh || 'Không có'}</span>
                </div>
                <div class="field">
                  <span class="label">Ngày sinh:</span>
                  <span class="value">${formData.ngaysinh || 'Không có'}/${formData.thangsinh || 'Không có'}/${formData.namsinh || 'Không có'}</span>
                </div>
              </div>

              <div class="section">
                <h3>Thông Tin Học Vấn</h3>
                <div class="field">
                  <span class="label">Trường đại học:</span>
                  <span class="value">${formData.truongdaihoc || 'Không có'}</span>
                </div>
                <div class="field">
                  <span class="label">Chuyên ngành:</span>
                  <span class="value">${formData.chuyennganh || 'Không có'}</span>
                </div>
                <div class="field">
                  <span class="label">Bằng cấp:</span>
                  <span class="value">${formData.bangcap || 'Không có'}</span>
                </div>
                <div class="field">
                  <span class="label">Thời gian nhận bằng:</span>
                  <span class="value">${formData.thangnhanbang || 'Không có'}/${formData.namnhanbang || 'Không có'}</span>
                </div>
              </div>

              <div class="section">
                <h3>Kinh Nghiệm Làm Việc</h3>
                <div class="field">
                  <span class="label">Công ty gần đây:</span>
                  <span class="value">${formData.kinhnghiemcongtyganday || 'Không có'}</span>
                </div>
                <div class="field">
                  <span class="label">Công việc gần đây:</span>
                  <span class="value">${formData.kinhnghiemcongviecganday || 'Không có'}</span>
                </div>
                <div class="field">
                  <span class="label">Thời gian:</span>
                  <span class="value">Từ ${formData.kinhnghiemtuthang || 'Không có'}/${formData.kinhnghiemtunam || 'Không có'} 
                    đến ${formData.kinhnghiemdenthang || 'Không có'}/${formData.kinhnghiemdennam || 'Không có'}</span>
                </div>
              </div>

              <div class="section">
                <h3>Thông Tin Khác</h3>
                <div class="field">
                  <span class="value">${formData.thongtinkhac || 'Không có'}</span>
                </div>
              </div>

              <div class="cv-status">
                ${attachments.length > 0 ? 
                  '<strong>✓ CV đã được đính kèm trong email</strong>' : 
                  '⚠ Không có CV đính kèm'}
              </div>

              <div class="footer">
                <p>Email này được gửi tự động từ hệ thống tuyển dụng THD.</p>
                <p>Vui lòng kiểm tra trong admin panel để xem thêm chi tiết.</p>
              </div>
            </div>
          </body>
          </html>
        `
      };

      logToFile(`Preparing to send email with data: ${JSON.stringify(emailData, null, 2)}`);

      try {
        // Gửi email
        logToFile('Sending email...');
        const emailResult = await strapi.plugins['email'].services.email.send(emailData);
        logToFile(`Email sent successfully: ${JSON.stringify(emailResult, null, 2)}`);
      } catch (emailErr) {
        logToFile(`Error sending email: ${emailErr.message}`);
        logToFile(`Email error details: ${JSON.stringify(emailErr, null, 2)}`);
        // Không throw lỗi ở đây để vẫn trả về response thành công
        console.error('Error sending email:', emailErr);
      }

      return { data };
    } catch (err) {
      logToFile(`Error in create controller: ${err.message}`);
      logToFile(`Full error details: ${JSON.stringify(err, null, 2)}`);
      logToFile(`Error stack: ${err.stack}`);
      ctx.throw(500, err.message);
    }
  },
}));
