pub struct SFTPSession {
    pub id: String,
    pub session: russh_sftp::client::SftpSession,
}

#[derive(Default)]
pub struct SFTPConnectionState {
    pub session: Option<SFTPSession>,
}
