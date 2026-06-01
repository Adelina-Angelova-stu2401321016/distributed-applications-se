namespace MuseumManagmentSystem.Entities
{
    public class Student
    {
        public int ID { get; set; } 
        public DateTime DT { get; set; } 
        public string FName { get; set; } 
        public string LName { get; set; } 
        public int PartnerID { get; set; } 
        public Partner Partner { get; set; }
        public bool IsDeleted { get; set; }
        public DateTime? DltDT { get; set; }


    }
}
