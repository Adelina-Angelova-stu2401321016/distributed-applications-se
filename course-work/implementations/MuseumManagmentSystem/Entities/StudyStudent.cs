namespace MuseumManagmentSystem.Entities
{
    public class StudyStudent
    {
        public int ID { get; set; } 
        public DateTime DT { get; set; } 
        public int StudyID { get; set; }
        public Study Study { get; set; }
        public int StudentID { get; set; }
        public Student Student { get; set; }
        public bool IsDeleted { get; set; }
        public DateTime? DltDT { get; set; }


    }
}
