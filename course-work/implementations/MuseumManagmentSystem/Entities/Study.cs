namespace MuseumManagmentSystem.Entities
{
    public class Study
    {
        public int ID { get; set; } 
        public DateTime DT { get; set; } 
        public string StudyName { get; set; } 
        public string Description { get; set; } 
        public DateTime StartDate { get; set; } 
        public DateTime EndDate { get; set; }
        public bool IsDeleted { get; set; }
        public DateTime? DltDT { get; set; }

    }
}
