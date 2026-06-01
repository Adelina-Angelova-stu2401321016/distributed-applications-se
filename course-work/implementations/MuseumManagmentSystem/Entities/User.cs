namespace MuseumManagmentSystem.Entities
{
    public class User
    {
        public int ID { get; set; }
        public DateTime DT { get; set; }
        public string Username { get; set; } 
        public string Password { get; set; }
        public string FName { get; set; }
        public string LName { get; set; }
            
        public int UserRoleID { get; set; }
        public UserRole UserRole { get; set; }
        public bool IsDeleted { get; set; }
        public DateTime? DltDT { get; set; }

    }
}
